// src/app/features/shop-owner/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderService, Order } from '../../../core/services/order.service';
import { StatWidget } from '../components/stat-widget/stat-widget';
import { RecentOrdersWidgetComponent} from '../components/recent-orders-widget/recent-orders-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatWidget,
    RecentOrdersWidgetComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
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
    avgRating: 0
  };

  constructor(
    private shopService: ShopService,
    private productService: ProductService,
    private orderService: OrderService
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
          this.shop = response.boutique;
          this.stats.products = response.boutique.productqt;
          this.stats.orders = response.boutique.commandeqt;
          this.stats.revenue = response.boutique.CA;
          this.stats.avgRating = response.boutique.avgRating;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement boutique:', error);
        this.loading = false;
      }
    });

    // Charger les dernières commandes
    this.orderService.getMyShopOrders({ limit: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.commandes) {
          this.recentOrders = response.commandes;
        }
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'en_attente': '⏳ En attente de validation',
      'active': ' Active',
      'suspendue': ' Suspendue'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'en_attente': 'status-warning',
      'active': 'status-success',
      'suspendue': 'status-danger'
    };
    return classes[status] || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}