import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductService } from '../../../core/services/product.service';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../directives/image-error.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ImageErrorDirective, MatIconModule, MatButtonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private shopService = inject(ShopService);
  private cartService = inject(ShoppingCartService);
  private authService = inject(AuthService);

  product = signal<Product | null>(null);
  shop = signal<Shop | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  selectedImage = signal<string>('');
  userRating = signal<number>(0);
  ratingSubmitted = signal<boolean>(false);
  private productId = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(id);
      this.productService.getProductById(id).subscribe({
        next: (res) => {
          if (res && res.produit) {
            this.product.set(res.produit);
            if (res.produit.images && res.produit.images.length > 0) {
              this.selectedImage.set(res.produit.images[0]);
            }
            // Charger la boutique
            if (res.produit.boutiqueId) {
              this.shopService.getShopById(res.produit.boutiqueId).subscribe({
                next: (shopRes) => {
                  if (shopRes && shopRes.boutique) {
                    this.shop.set(shopRes.boutique);
                  }
                  this.loading.set(false);
                },
                error: () => {
                  this.loading.set(false);
                },
              });
            } else {
              this.loading.set(false);
            }
          } else {
            this.error.set('Produit introuvable');
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.error.set('Erreur lors du chargement du produit');
          this.loading.set(false);
        },
      });
    } else {
      this.error.set('Identifiant manquant');
      this.loading.set(false);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return `${environment.apiUrl.replace('/api', '')}${normalizedPath}`;
  }

  selectImage(image: string): void {
    this.selectedImage.set(image);
  }

  addToCart(): void {
    // Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    const prod = this.product();
    if (prod) {
      this.cartService.add(prod);
    }
  }

  goToShop(): void {
    const shopId = this.product()?.boutiqueId;
    if (shopId) {
      this.router.navigate(['/boutique', shopId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/product-list']);
  }

  setRating(rating: number): void {
    this.userRating.set(rating);
  }

  submitRating(): void {
    const rating = this.userRating();
    const prodId = this.productId();
    if (rating > 0 && prodId) {
      this.ratingSubmitted.set(true);
      this.productService.submitRating(prodId, rating).subscribe({
        next: (res) => {
          if (res.success && res.produit) {
            const updatedProduct = this.product();
            if (updatedProduct) {
              updatedProduct.avgRating = res.produit.avgRating;
              updatedProduct.reviewCount = res.produit.reviewCount;
              this.product.set(updatedProduct);
            }
            console.log(`Note ${rating}/5 soumise avec succès`);
          }
          setTimeout(() => {
            this.ratingSubmitted.set(false);
            this.userRating.set(0);
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la soumission de l\'évaluation:', err);
          this.ratingSubmitted.set(false);
        },
      });
    }
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
