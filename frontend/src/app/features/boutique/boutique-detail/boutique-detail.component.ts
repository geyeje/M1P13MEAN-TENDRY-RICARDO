// src/app/features/boutiques/boutique-detail/boutique-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { ProductCardComponent } from './product-card.component';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ImageErrorDirective],
  templateUrl: './boutique-detail.component.html',
  styleUrls: ['./boutique-detail.component.scss'],
})
export class BoutiqueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);
  private productService = inject(ProductService);

  boutique: Shop | null = null;
  products: Product[] = [];
  productsOnSale: Product[] = [];
  featuredProducts: Product[] = [];

  loading = true;
  loadingProducts = true;
  error: string | null = null;

  currentTab: 'all' | 'promo' | 'featured' = 'all';

  // Pagination produits
  productPage = 1;
  productTotalPages = 1;
  productLimit = 12;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBoutique(id);
      this.loadProducts(id);
    } else {
      this.error = 'Boutique non trouvée';
      this.loading = false;
    }
  }

  loadBoutique(id: string): void {
    this.loading = true;
    this.error = null;

    this.shopService.getShopById(id).subscribe({
      next: (response) => {
        this.boutique = response.boutique ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement boutique:', err);
        this.error = 'Impossible de charger les informations de la boutique';
        this.loading = false;
      },
    });
  }

  loadProducts(id: string, loadAll = true): void {
    this.loadingProducts = true;

    // Charger tous les produits
    if (loadAll) {
      this.productService
        .getProductsByBoutique(id, {
          page: this.productPage,
          limit: this.productLimit,
        })
        .subscribe({
          next: (response) => {
            this.products = response.produits || [];
            this.productTotalPages = response.totalPages || 1;
            this.loadingProducts = false;
          },
          error: (err) => {
            console.error('Erreur chargement produits:', err);
            this.loadingProducts = false;
          },
        });
    }

    // Charger les produits en promo
    this.productService
      .getProductsByBoutique(id, {
        onSale: true,
        limit: 6,
      })
      .subscribe({
        next: (response) => {
          this.productsOnSale = response.produits || [];
        },
        error: (err) => console.error('Erreur chargement produits promo:', err),
      });

    // Charger les produits vedettes
    this.productService
      .getProductsByBoutique(id, {
        sort: '-salesCount',
        limit: 6,
      })
      .subscribe({
        next: (response) => {
          this.featuredProducts = response.produits || [];
        },
        error: (err) => console.error('Erreur chargement produits vedettes:', err),
      });
  }

  getImageUrl(path: string | null | undefined): string {
    return this.shopService.getImageUrl(path);
  }

  formatSchedule(day: string): string {
    if (!this.boutique?.schedule) return 'Fermé';

    const schedule = this.boutique.schedule[day as keyof typeof this.boutique.schedule];
    if (!schedule || schedule.ferme) return 'Fermé';

    return `${schedule.ouverture} - ${schedule.fermeture}`;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'status-success',
      en_attente: 'status-warning',
      suspendue: 'status-danger',
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      en_attente: 'En attente',
      suspendue: 'Suspendue',
    };
    return labels[status] || status;
  }

  changeProductPage(page: number): void {
    if (page >= 1 && page <= this.productTotalPages && this.boutique) {
      this.productPage = page;
      this.loadProducts(this.boutique._id);
      window.scrollTo({
        top: document.getElementById('products-section')?.offsetTop || 0,
        behavior: 'smooth',
      });
    }
  }

  setTab(tab: 'all' | 'promo' | 'featured'): void {
    this.currentTab = tab;
  }

  getCurrentProducts(): Product[] {
    switch (this.currentTab) {
      case 'promo':
        return this.productsOnSale;
      case 'featured':
        return this.featuredProducts;
      default:
        return this.products;
    }
  }
}
