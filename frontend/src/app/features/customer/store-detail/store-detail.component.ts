import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, ImageErrorDirective],
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss',
})
export class StoreDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private productService = inject(ProductService);
  private cartService = inject(ShoppingCartService);
  private authService = inject(AuthService);
  private shopId = signal<string>('');

  boutique = signal<Shop | null>(null);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  userRating = signal<number>(0);
  ratingSubmitted = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shopId.set(id);
      this.shopService.getShopById(id).subscribe({
        next: (res) => {
          if (res && res.boutique) {
            this.boutique.set(res.boutique);
            this.loadShopProducts();
          } else {
            this.error.set('Boutique introuvable');
            this.loading.set(false);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors du chargement de la boutique');
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
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  private loadShopProducts(): void {
    // Charger les produits de la boutique
    this.productService.getAllProducts({ shop: this.shopId() }).subscribe({
      next: (res) => {
        if (res && res.produits) {
          this.products.set(res.produits);
        }
      },
      error: (err) => {
        console.error('Erreur chargement produits boutique:', err);
      },
    });
  }

  formatScheduleDay(day: any): string {
    if (!day || day.ferme) {
      return 'Fermé';
    }
    return `${day.ouverture || 'N/A'} - ${day.fermeture || 'N/A'}`;
  }

  getOpeningHours(): Record<string, string> {
    const shop = this.boutique();
    if (!shop || !shop.schedule) return {};
    const schedule: any = shop.schedule;
    return {
      Lundi: this.formatScheduleDay(schedule.lundi),
      Mardi: this.formatScheduleDay(schedule.mardi),
      Mercredi: this.formatScheduleDay(schedule.mercredi),
      Jeudi: this.formatScheduleDay(schedule.jeudi),
      Vendredi: this.formatScheduleDay(schedule.vendredi),
      Samedi: this.formatScheduleDay(schedule.samedi),
      Dimanche: this.formatScheduleDay(schedule.dimanche),
    };
  }

  addToCart(product: Product): void {
    // Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    try {
      this.cartService.add(product);
      console.log('Produit ajouté au panier:', product._id || product.name);
    } catch (e) {
      console.error('Erreur ajout panier', e);
    }
  }

  setRating(rating: number): void {
    this.userRating.set(rating);
  }

  submitRating(): void {
    const rating = this.userRating();
    const shopId = this.shopId();
    if (rating > 0 && shopId) {
      this.ratingSubmitted.set(true);
      this.shopService.submitRating(shopId, rating).subscribe({
        next: (res) => {
          if (res.success && res.boutique) {
            // Mettre à jour les données de la boutique avec les nouvelles notes
            const updatedBoutique = this.boutique();
            if (updatedBoutique) {
              updatedBoutique.avgRating = res.boutique.avgRating;
              updatedBoutique.reviewCount = res.boutique.reviewCount;
              this.boutique.set(updatedBoutique);
            }
            console.log(`Note ${rating}/5 soumise avec succès`);
          }
          // Réinitialiser après 3 secondes
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