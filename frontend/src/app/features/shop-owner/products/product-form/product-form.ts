import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, Routes } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  productService = inject(ProductService);
  authService = inject(AuthService);
  currentShopId = signal(this.authService.currentUserValue?.id);
  errorMessage = signal<string>('');
  saved = output();

  fb = inject(NonNullableFormBuilder);
  productToEdit = input<Product | null>(null);
  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.required, Validators.min(0)]],
    promoPrice: [ null as number | null, [Validators.min(0)]],
    onSale: [false],
    category: ['Autre', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    brand: [ null as string | null],
    colors: [[] as string[]],
    sizes: [[] as string[]],
    specs: [null as any],
    tags: [[] as string[]],
    // control must hold either existing URLs (string) or File objects when selecting new images
    images: [[] as (string | File)[]]
  })

  constructor(private router: Router){}

  ngOnInit(): void {
    const p = this.productToEdit();
    if (p){
      // when editing we need to convert arrays to comma-strings for the inputs
      const clone = { ...p } as any;
      // backend sometimes returns promotionPrice instead of promoPrice
      if (clone.promotionPrice !== undefined) clone.promoPrice = clone.promotionPrice;

      if (Array.isArray(clone.colors)) clone.colors = clone.colors.join(', ');
      if (Array.isArray(clone.sizes)) clone.sizes = clone.sizes.join(', ');
      if (Array.isArray(clone.tags)) clone.tags = clone.tags.join(', ');
      if (clone.specs && typeof clone.specs === 'object') clone.specs = JSON.stringify(clone.specs);
      this.productForm.patchValue(clone);
    }
  }

  /** Convert a comma-separated string into an array on the form control */
  splitArray(field: string) {
    const control = this.productForm.get(field);
    if (!control) return;
    const val = control.value;
    if (typeof val === 'string') {
      const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
      control.setValue(arr);
    }
  }

  /** Store selected File objects in the form control (not just names) */
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const filesArray: File[] = Array.from(input.files);
    this.productForm.get('images')?.setValue(filesArray);
  }

  onSubmit(){
    if(this.productForm.valid){
      const rawData = this.productForm.getRawValue();
      const formData = new FormData();

      Object.keys(rawData).forEach((key) => {
        let value = (rawData as any)[key];

        if (value == null || value == undefined) {
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

        // handle file arrays separately
        if (Array.isArray(value)) {
          if (value.length > 0 && value[0] instanceof File) {
            value.forEach((file: File) => formData.append('images', file));
            return;
          }
          value.forEach((item) => formData.append(`${key}[]`, item));
          return;
        }

        formData.append(key, value);
      });

      if(this.productToEdit()){
        this.productService.updateProduct(this.productToEdit()!._id, formData).subscribe({
          next: (res) => {
            console.log("Réponse reçu: ", res.produit);
            this.productForm.reset();
            this.router.navigate(['/shop-owner/product-list']);
            this.saved.emit();
          },
          error: (err) =>{
            console.error("erreur :", err);
            const msg = err?.error?.message || err?.message || 'Erreur lors de la mise à jour';
            this.errorMessage.set(msg);
          }
        });
      }else{
        this.productService.createProduct(formData).subscribe({
          next:(res) => {
            console.log("Réponse reçu: ", res.produit);
            this.productForm.reset();
            this.router.navigate(['/shop-owner/product-list']);
            this.saved.emit();
          },
          error: (err) => {
            console.error('erreur création produit:', err);
            const msg = err?.error?.message || err?.message || 'Erreur lors de la création du produit';
            this.errorMessage.set(msg);
          }
        });
      }
    }
  }
}
