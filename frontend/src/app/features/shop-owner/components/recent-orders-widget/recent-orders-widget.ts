// src/app/features/shop-owner/components/recent-orders-widget/recent-orders-widget.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order, OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-recent-orders-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recent-orders-widget.html',
  styleUrls: ['./recent-orders-widget.scss']
})
export class RecentOrdersWidgetComponent {
  @Input() orders: Order[] = [];
  @Input() limit: number = 5;

  constructor(public orderService: OrderService) {}

  get limitedOrders(): Order[] {
    return this.orders.slice(0, this.limit);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}