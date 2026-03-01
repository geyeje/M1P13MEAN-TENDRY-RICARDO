import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order, OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList {
  orders: Order[] = [];
  loading = true;
  selectedStatus = 'all';

  statuses = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' },
  ];

  constructor(public orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const params = this.selectedStatus !== 'all' ? { status: this.selectedStatus } : {};

    this.orderService.getMyShopOrders(params).subscribe({
      next: (response) => {
        if (response.success && response.commandes) {
          this.orders = response.commandes;
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.loadOrders();
  }

  quickUpdateStatus(orderId: string, newStatus: string) {
    this.orderService.updateStatus(orderId, { status: newStatus }).subscribe({
      next: () => this.loadOrders(),
      error: () => alert('Erreur mise à jour statut'),
    });
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
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
