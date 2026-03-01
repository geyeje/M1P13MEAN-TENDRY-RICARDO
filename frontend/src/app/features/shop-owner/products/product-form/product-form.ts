import { Component, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit, OnDestroy {
  productService = inject(ProductService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  currentShopId = signal(this.authService.currentUserValue?.id);
  errorMessage = signal<string>('');
  loadingProduct = signal(false);
  saved = output();

  fb = inject(NonNullableFormBuilder);
  /** Produit passé directement via @Input (usage embedded) */
  productToEdit = input<Product | null>(null);
  /** Produit chargé depuis l'URL /:id (usage routing) */
  private _routeProduct = signal<Product | null>(null);

  /** Retourne le produit à éditer (depuis input ou route) */
  get editingProduct(): Product | null {
    return this.productToEdit() ?? this._routeProduct();
  }

  /** URLs des images déjà enregistrées en BDD (mode édition) */
  existingImages = signal<string[]>([]);

  /** Fichiers sélectionnés par l'utilisateur pour l'upload */
  newImageFiles = signal<File[]>([]);

  /** Aperçu (ObjectURL) des nouvelles images sélectionnées */
  newImagePreviews = signal<string[]>([]);

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.required, Validators.min(0)]],
    promoPrice: [null as number | null, [Validators.min(0)]],
    onSale: [false],
    category: ['Autres', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    brand: [null as string | null],
    colors: [[] as string[]],
    sizes: [[] as string[]],
    specs: [null as any],
    tags: [[] as string[]],
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cas 1 : produit passé directement via @Input (embedded)
    if (this.productToEdit()) {
      this.patchFormWithProduct(this.productToEdit()!);
      return;
    }

    // Cas 2 : navigation vers /products/edit/:id → charger depuis l'API
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadingProduct.set(true);
      this.productService.getProductById(id).subscribe({
        next: (res) => {
          if (res.success && res.produit) {
            this._routeProduct.set(res.produit);
            this.patchFormWithProduct(res.produit);
          } else {
            this.errorMessage.set('Produit introuvable');
          }
          this.loadingProduct.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors du chargement du produit');
          this.loadingProduct.set(false);
        },
      });
    }
  }

  private patchFormWithProduct(p: Product) {
    // Charger les images existantes séparément
    this.existingImages.set(p.images || []);

    const clone = { ...p } as any;
    // backend sometimes returns promotionPrice instead of promoPrice
    if (clone.promotionPrice !== undefined) clone.promoPrice = clone.promotionPrice;

    if (Array.isArray(clone.colors)) clone.colors = clone.colors.join(', ');
    if (Array.isArray(clone.sizes)) clone.sizes = clone.sizes.join(', ');
    if (Array.isArray(clone.tags)) clone.tags = clone.tags.join(', ');
    if (clone.specs && typeof clone.specs === 'object') clone.specs = JSON.stringify(clone.specs);
    this.productForm.patchValue(clone);
  }

  /** Retourne l'URL complète pour afficher une image existante */
  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  /** Supprimer une image existante (côté client seulement — sera exclue à la soumission) */
  removeExistingImage(index: number) {
    const current = [...this.existingImages()];
    current.splice(index, 1);
    this.existingImages.set(current);
  }

  /** Supprimer une nouvelle image sélectionnée */
  removeNewImage(index: number) {
    const files = [...this.newImageFiles()];
    const previews = [...this.newImagePreviews()];
    URL.revokeObjectURL(previews[index]);
    files.splice(index, 1);
    previews.splice(index, 1);
    this.newImageFiles.set(files);
    this.newImagePreviews.set(previews);
  }

  /** Convert a comma-separated string into an array on the form control */
  splitArray(field: string) {
    const control = this.productForm.get(field);
    if (!control) return;
    const val = control.value;
    if (typeof val === 'string') {
      const arr = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      control.setValue(arr);
    }
  }

  /** Store selected File objects with preview generation */
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const filesArray: File[] = Array.from(input.files);

    // Vérifier la limite totale (images existantes + nouvelles)
    const totalImages = this.existingImages().length + filesArray.length;
    if (totalImages > 5) {
      this.errorMessage.set(
        `Vous ne pouvez avoir que 5 images au total. Actuellement ${this.existingImages().length} image(s) existante(s).`,
      );
      input.value = '';
      return;
    }
    this.errorMessage.set('');

    // Révoquer les anciens ObjectURLs pour éviter les fuites mémoire
    this.newImagePreviews().forEach((url) => URL.revokeObjectURL(url));

    const previews = filesArray.map((file) => URL.createObjectURL(file));
    this.newImageFiles.set(filesArray);
    this.newImagePreviews.set(previews);
  }

  onSubmit() {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    const rawData = this.productForm.getRawValue();
    const formData = new FormData();

    Object.keys(rawData).forEach((key) => {
      let value = (rawData as any)[key];

      if (value == null || value == undefined) {
        formData.append(key, '');
        return;
      }

      // specs textarea may contain a JSON string, convert back to object or string
      if (key === 'specs' && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // leave as string if invalid JSON
        }
      }

      // handle arrays (colors, sizes, tags)
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, value);
    });

    // Ajouter les images existantes conservées (en mode édition)
    this.existingImages().forEach((url) => formData.append('existingImages[]', url));

    // Ajouter les nouveaux fichiers images
    this.newImageFiles().forEach((file: File) => formData.append('images', file));

    const productId = this.editingProduct?._id;

    if (productId) {
      // Mode édition
      this.productService.updateProduct(productId, formData).subscribe({
        next: (res) => {
          console.log('Produit mis à jour: ', res.produit);
          this.productForm.reset();
          this.router.navigate(['/shop-owner/products']);
          this.saved.emit();
        },
        error: (err) => {
          console.error('erreur mise à jour:', err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la mise à jour');
        },
      });
    } else {
      // Mode création
      this.productService.createProduct(formData).subscribe({
        next: (res) => {
          console.log('Produit créé: ', res.produit);
          this.productForm.reset();
          this.router.navigate(['/shop-owner/products']);
          this.saved.emit();
        },
        error: (err) => {
          console.error('erreur création:', err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création');
        },
      });
    }
  }

  ngOnDestroy() {
    // Nettoyer les ObjectURLs
    this.newImagePreviews().forEach((url) => URL.revokeObjectURL(url));
  }
}
