// src/app/features/shop-owner/my-shop/my-shop.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop';
import { OrderService } from '../../../core/services/order.service';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageErrorDirective],
  templateUrl: './my-shop.html',
  styleUrls: ['./my-shop.scss'],
})
export class MyShopComponent implements OnInit {
  shop: Shop | null = null;
  loading = true;
  error = '';
  // revenue computed from orders (more reliable than shop.CA)
  computedRevenue = 0;

  constructor(private shopService: ShopService, private orderService: OrderService) {}

  ngOnInit() {
    this.loadShop();
  }

  loadShop() {
    this.loading = true;
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          this.shop = response.boutique;
          // rafraîchir revenu via commandes
          this.computeRevenue();
        } else {
          this.error = 'Boutique non trouvée';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement boutique:', error);
        this.error = error.error?.message || 'Erreur lors du chargement de la boutique';
        this.loading = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      en_attente: 'En attente de validation',
      active: 'Active',
      suspendue: 'Suspendue',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      en_attente: 'status-warning',
      active: 'status-success',
      suspendue: 'status-danger',
    };
    return classes[status] || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // Backward compat helpers
  get productCount(): number {
    return (this.shop as any)?.productCount ?? (this.shop as any)?.productqt ?? 0;
  }
  get commandCount(): number {
    return (this.shop as any)?.commandCount ?? (this.shop as any)?.commandeqt ?? 0;
  }
  get rating(): number {
    return (this.shop as any)?.note ?? (this.shop as any)?.avgRating ?? 0;
  }
  get address(): string {
    return (this.shop as any)?.address ?? (this.shop as any)?.adresse ?? '';
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  // calculer CA réel en interrogeant les commandes de la boutique
  computeRevenue(): void {
    this.orderService.getMyShopOrders({})
      .subscribe({
        next: (res) => {
          if (res.success && res.commandes) {
            const total = res.commandes
              .filter((c: any) => c.paymentStatus === 'paid' || c.status === 'confirmed')
              .reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0);
            this.computedRevenue = total;
            console.log('[my-shop] computedRevenue from commandes:', total);
          }
        },
        error: (err) => {
          console.error('Erreur calcul revenu shop:', err);
        }
      });
  }
}
