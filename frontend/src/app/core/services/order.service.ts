// src/app/core/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  productId: string | any;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  color?: string;
  size?: string;
  image?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderCount?: string; // Pour compatibilité ancienne base
  buyerId: any;
  items: (OrderItem & { shopId?: string })[];
  shopIds?: string[]; // boutiques impliquées
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: string;
  paymentMethod?: string;
  deliveryDate?: string;
  statusHistory: Array<{
    status: string;
    date: string;
    comment: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  commande?: Order;
  commandes?: Order[];
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/commandes`;

  constructor(private http: HttpClient) {}

  // Commandes de ma boutique (gérant)
  getMyShopOrders(params?: any): Observable<OrderResponse> {
    let queryParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          queryParams = queryParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<OrderResponse>(`${this.apiUrl}/shop/orders`, { params: queryParams });
  }

  // Mes commandes (acheteur)
  getMyOrders(params?: any): Observable<OrderResponse> {
    let queryParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          queryParams = queryParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<OrderResponse>(`${this.apiUrl}/me/myorders`, { params: queryParams });
  }

  // Détails d'une commande
  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`);
  }

  // Créer une commande (acheteur)
  createOrder(data: any): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, data);
  }

  // Changer le statut (gérant/admin)
  updateStatus(
    orderId: string,
    data: { status: string; comment?: string },
  ): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/status`, data);
  }

  // Annuler une commande (acheteur)
  cancelOrder(orderId: string, reason?: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/cancel`, { reason });
  }

  // Toutes les commandes (admin)
  getAllOrders(params?: any): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(this.apiUrl, { params });
  }

  // Statistiques (admin)
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  // Statuts disponibles
  getAvailableStatuses(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'pending', label: 'En attente', color: 'warning' },
      { value: 'confirmed', label: 'Confirmée', color: 'info' },
      { value: 'processing', label: 'En préparation', color: 'primary' },
      { value: 'shipped', label: 'Expédiée', color: 'secondary' },
      { value: 'delivered', label: 'Livrée', color: 'success' },
      { value: 'cancelled', label: 'Annulée', color: 'danger' },
    ];
  }

  // Label du statut
  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return statuses[status] || status;
  }

  // Couleur du badge selon le statut
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return colors[status] || 'secondary';
  }
}
