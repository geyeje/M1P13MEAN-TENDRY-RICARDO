// src/app/features/shop-owner/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop';
import { ProductService } from '../../../core/services/product.service';
import { OrderService, Order } from '../../../core/services/order.service';
import { StatWidget } from '../components/stat-widget/stat-widget';
import { RecentOrdersWidgetComponent } from '../components/recent-orders-widget/recent-orders-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatWidget, RecentOrdersWidgetComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  shop: Shop | null = null;
  recentOrders: Order[] = [];

  // Stats
  stats = {
    products: 0,
    orders: 0,
    revenue: 0,
    avgRating: 0,
  };

  constructor(
    private shopService: ShopService,
    private productService: ProductService,
    private orderService: OrderService,
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    // Charger ma boutique
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          const b = response.boutique as any;
          this.shop = response.boutique;
          // Support both old and new field names
          this.stats.products = b.productCount ?? b.productqt ?? 0;
          this.stats.revenue = b.CA ?? 0;
          this.stats.avgRating = b.note ?? b.avgRating ?? 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement boutique:', error);
        this.loading = false;
      },
    });

    // Charger les dernières commandes
    this.orderService.getMyShopOrders({ limit: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.commandes) {
          this.recentOrders = response.commandes;
          // Utiliser le nombre réel de commandes au lieu de commandeqt
          this.stats.orders = response.commandes.length;
          // Calculer le revenue réel à partir des commandes confirmées/payées
          this.stats.revenue = response.commandes
            .filter((c: any) => c.paymentStatus === 'paid' || c.status === 'confirmed')
            .reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0);
        }
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      en_attente: 'En attente',
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
}
