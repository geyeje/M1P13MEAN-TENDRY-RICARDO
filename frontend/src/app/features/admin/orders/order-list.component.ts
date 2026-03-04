import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 d-flex align-items-center gap-2" style="color: var(--cui-body-color)">
          <mat-icon>shopping_basket</mat-icon>
          Historique des Commandes
        </h1>
      </div>

      <!-- Filtres -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <select class="form-select" [(ngModel)]="status" (change)="loadOrders()">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card shadow mb-4">
        <div class="card-header py-3 bg-body-tertiary">
          <h6 class="m-0 font-weight-bold text-primary">Toutes les Commandes</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of orders">
                  <td>
                    <strong>{{ order.orderNumber }}</strong>
                  </td>
                  <td>
                    {{ order.buyerId?.lastname }} {{ order.buyerId?.firstname }}
                    <div class="small text-muted">{{ order.buyerId?.email }}</div>
                  </td>
                  <td>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <strong>{{ order.totalAmount | number: '1.2-2' }} €</strong>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td>
                    <a
                      [routerLink]="['/admin/orders', order._id]"
                      class="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1"
                    >
                      <mat-icon style="font-size: 1rem; width: 1rem; height: 1rem;"
                        >visibility</mat-icon
                      >
                      Voir Détail
                    </a>
                  </td>
                </tr>
                <tr *ngIf="orders.length === 0 && !loading">
                  <td colspan="6" class="text-center py-4 text-muted">Aucune commande trouvée</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .badge {
        font-weight: 500;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  status = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const params = this.status ? { status: this.status } : {};

    this.adminService.getOrders(params).subscribe({
      next: (res) => {
        this.orders = res.commandes;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-warning',
      confirmed: 'bg-info',
      processing: 'bg-primary',
      shipped: 'bg-secondary',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
  }
}
