import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order, OrderService } from '../../../../core/services/order.service';
import { ShopService } from '../../../../core/services/shop.service';
import { ProductService } from '../../../../core/services/product.service';

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
  shopId: string | null = null;
  private shopProductIds = new Set<string>();

  statuses = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' },
  ];

  private shopService = inject(ShopService);
  private productService = inject(ProductService);
  constructor(public orderService: OrderService) {}

  ngOnInit() {
    // récupérer l'identifiant de la boutique courante
    this.shopService.getMyShop().subscribe({
      next: (res: any) => {
        if (res && res.boutique) {
          this.shopId = res.boutique._id;
          // charger la liste des produits de la boutique pour connaître leurs IDs
          this.productService.getAllProducts({ shop: this.shopId }).subscribe((resp: any) => {
            if (resp && resp.produits) {
              resp.produits.forEach((p: any) => this.shopProductIds.add(p._id));
            }
          });
        }
      },
      error: () => {
        // ignore
      },
    });

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

  canEdit(order: Order): boolean {
    // si la commande contient explicitement shopIds on regarde
    if (this.shopId && order.shopIds && order.shopIds.includes(this.shopId)) {
      return true;
    }
    // fallback : si un des items contient shopId égal
    if (this.shopId && order.items) {
      const hasItemShop = order.items.some((it: any) => it.shopId === this.shopId);
      if (hasItemShop) return true;
      // si aucun item ne porte de shopId, on vérifie que le produit existe toujours dans la boutique
      return order.items.every((it: any) => this.shopProductIds.has(it.productId));
    }
    // en dernier recours, autoriser (pas de données disponibles)
    return true;
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
