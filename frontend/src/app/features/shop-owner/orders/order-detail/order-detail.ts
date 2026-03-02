import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Order, OrderService } from '../../../../core/services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4" *ngIf="order">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Commande #{{ order.orderNumber || order.orderCount }}</h1>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm bg-dark-theme-dynamic" [(ngModel)]="newStatus" style="width: auto;">
            <option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</option>
          </select>
          <button class="btn btn-primary btn-sm" (click)="updateStatus()">Mettre à jour</button>
        </div>
      </div>

      <div class="row">
        <!-- Informations Client -->
        <div class="col-lg-4">
          <div class="card mb-4 h-100 border-theme">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold">Informations Client</h6>
            </div>
            <div class="card-body">
              <p>
                <strong>Nom :</strong> {{ order.buyerId?.lastname }} {{ order.buyerId?.firstname }}
              </p>
              <p><strong>Email :</strong> {{ order.buyerId?.email }}</p>
              <p><strong>Tél :</strong> {{ order.phone }}</p>
              <hr />
              <p><strong>Adresse de livraison :</strong><br />{{ order.shippingAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Détails Produits -->
        <div class="col-lg-8">
          <div class="card mb-4 border-theme">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold">Articles du Panier</h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="bg-theme-subtle">
                    <tr>
                      <th>Produit</th>
                      <th>Prix Unitaire</th>
                      <th>Quantité</th>
                      <th class="text-end">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of order.items">
                      <td>
                        {{ item.name }}
                        <div class="small text-muted" *ngIf="item.color || item.size">
                          {{ item.color }} {{ item.size ? '/ ' + item.size : '' }}
                        </div>
                      </td>
                      <td>{{ formatCurrency(item.unitPrice) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="text-end fw-bold">{{ formatCurrency(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-theme-subtle">
                    <tr>
                      <td colspan="3" class="text-end fw-bold">TOTAL :</td>
                      <td class="text-end fw-bold fs-5">
                        {{ formatCurrency(order.totalAmount) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    '.border-theme { border-color: var(--cui-border-color); }',
    '.bg-theme-subtle { background-color: var(--cui-tertiary-bg); color: var(--cui-body-color); }',
    'h1, h6 { color: var(--cui-body-color); }',
    '.bg-dark-theme-dynamic { background-color: var(--cui-card-bg); color: var(--cui-body-color); border-color: var(--cui-border-color); }'
  ],
})
export class OrderDetail implements OnInit {
  order?: Order;
  newStatus: string = '';
  statuses: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {
    this.statuses = this.orderService.getAvailableStatuses();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (res) => {
          if (res.success && res.commande) {
            this.order = res.commande;
            this.newStatus = this.order.status;
          }
        },
      });
    }
  }

  updateStatus() {
    if (!this.order) return;
    this.orderService.updateStatus(this.order._id, { status: this.newStatus }).subscribe({
      next: () => {
        if (this.order) this.order.status = this.newStatus as any;
        alert('Statut mis à jour !');
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
