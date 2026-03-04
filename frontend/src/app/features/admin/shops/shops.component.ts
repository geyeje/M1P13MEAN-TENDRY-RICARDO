import { Component, OnInit, inject } from '@angular/core';
import { PlatformSettingsService } from '../../../core/services/platform-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ShopService, Shop } from '../../../core/services/shop';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  template: `
    <div class="admin-shops">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="d-flex align-items-center gap-2">
            <mat-icon style="font-size: 2rem; width: 2rem; height: 2rem;">storefront</mat-icon>
            Gestion des Boutiques
          </h1>
          <p class="subtitle">Validez, suspendez ou consultez les boutiques de la plateforme</p>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-row" *ngIf="!loading">
        <div class="stat-box">
          <div class="stat-number">{{ totalShops }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-box stat-success">
          <div class="stat-number">{{ countByStatus('active') }}</div>
          <div class="stat-label">Actives</div>
        </div>
        <div class="stat-box stat-warning">
          <div class="stat-number">{{ countByStatus('en_attente') }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-box stat-danger">
          <div class="stat-number">{{ countByStatus('suspendue') }}</div>
          <div class="stat-label">Suspendues</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <button
            *ngFor="let f of statusFilters"
            (click)="filterByStatus(f.value)"
            [class.active]="selectedStatus === f.value"
            class="filter-btn"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des boutiques...</p>
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading && filteredShops.length > 0">
        <table class="shops-table">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Catégorie</th>
              <th>Gérant</th>
              <th>Produits</th>
              <th>CA</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let shop of filteredShops">
              <td>
                <div class="shop-cell">
                  <div class="shop-name">{{ shop.name }}</div>
                  <div class="shop-email">{{ shop.email }}</div>
                </div>
              </td>
              <td>
                <span class="category-badge">{{ shop.category }}</span>
              </td>
              <td>
                {{ shop.userId?.lastname || shop.userId?.nom || '' }}
                {{ shop.userId?.firstname || shop.userId?.prenom || '' }}
              </td>
              <td class="text-center">{{ shop.productCount || 0 }}</td>
              <td class="text-right">{{ formatCurrency(shop.CA || 0) }}</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="{
                    'status-active': shop.status === 'active',
                    'status-pending': shop.status === 'en_attente',
                    'status-suspended': shop.status === 'suspendue',
                  }"
                >
                  {{ getStatusLabel(shop.status) }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <!-- Valider (si en attente) -->
                  <button
                    *ngIf="shop.status === 'en_attente'"
                    class="btn-action btn-validate"
                    (click)="validateShop(shop._id, 'active')"
                    title="Valider"
                  >
                    <mat-icon>check_circle</mat-icon>
                  </button>

                  <!-- Suspendre (si active) -->
                  <button
                    *ngIf="shop.status === 'active'"
                    class="btn-action btn-suspend"
                    (click)="validateShop(shop._id, 'suspended')"
                    title="Suspendre"
                  >
                    <mat-icon>block</mat-icon>
                  </button>

                  <!-- Réactiver (si suspendue) -->
                  <button
                    *ngIf="shop.status === 'suspendue'"
                    class="btn-action btn-validate"
                    (click)="validateShop(shop._id, 'active')"
                    title="Réactiver"
                  >
                    <mat-icon>refresh</mat-icon>
                  </button>

                  <!-- Supprimer -->
                  <button
                    class="btn-action btn-delete"
                    (click)="deleteShop(shop._id)"
                    title="Supprimer"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredShops.length === 0" class="empty-state">
        <div class="empty-icon">
          <mat-icon style="font-size: 4rem; width: 4rem; height: 4rem;">storefront</mat-icon>
        </div>
        <h3>Aucune boutique trouvée</h3>
        <p>Aucune boutique ne correspond à vos critères de recherche.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-shops {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 1.5rem;
      }
      .page-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--cui-body-color);
        margin: 0 0 0.25rem;
      }
      .subtitle {
        color: var(--cui-body-secondary-color);
        margin: 0;
      }

      /* Stats Row */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .stat-box {
        background: var(--cui-card-bg);
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border-left: 4px solid var(--cui-border-color);
      }
      .stat-box.stat-success {
        border-left-color: #22c55e;
      }
      .stat-box.stat-warning {
        border-left-color: #f59e0b;
      }
      .stat-box.stat-danger {
        border-left-color: #ef4444;
      }
      .stat-number {
        font-size: 2rem;
        font-weight: 800;
        color: var(--cui-body-color);
      }
      .stat-label {
        color: var(--cui-body-secondary-color);
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }

      /* Filters */
      .filters-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .filter-group {
        display: flex;
        gap: 0.5rem;
      }
      .filter-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--cui-border-color);
        border-radius: 8px;
        background: var(--cui-card-bg);
        cursor: pointer;
        font-weight: 500;
        color: var(--cui-body-secondary-color);
        transition: all 0.2s;
      }
      .filter-btn:hover {
        background: var(--cui-secondary-bg);
      }
      .filter-btn.active {
        background: var(--cui-primary);
        color: white;
        border-color: var(--cui-primary);
      }
      .search-box {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--cui-body-secondary-color);
        font-size: 1.1rem;
        pointer-events: none;
      }
      .search-box input {
        padding: 0.5rem 1rem 0.5rem 2.5rem;
        border: 1px solid var(--cui-border-color);
        border-radius: 8px;
        background: var(--cui-input-bg, var(--cui-card-bg));
        color: var(--cui-body-color);
        width: 260px;
        font-size: 0.9rem;
        outline: none;
      }
      .search-box input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Loading */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem;
        color: #64748b;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 1rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Table */
      .table-container {
        background: var(--cui-card-bg);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }
      .shops-table {
        width: 100%;
        border-collapse: collapse;
      }
      .shops-table thead {
        background: var(--cui-tertiary-bg);
      }
      .shops-table th {
        padding: 0.875rem 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--cui-body-secondary-color);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid var(--cui-border-color);
      }
      .shops-table td {
        padding: 1rem;
        border-bottom: 1px solid var(--cui-border-color);
        vertical-align: middle;
      }
      .shops-table tbody tr:hover {
        background: var(--cui-secondary-bg);
      }

      .shop-cell {
        display: flex;
        flex-direction: column;
      }
      .shop-name {
        font-weight: 600;
        color: var(--cui-body-color);
      }
      .shop-email {
        font-size: 0.8rem;
        color: var(--cui-body-secondary-color);
      }

      .category-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #eff6ff;
        color: #3b82f6;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .text-center {
        text-align: center;
      }
      .text-right {
        text-align: right;
        font-weight: 600;
      }

      /* Status Badge */
      .status-badge {
        display: inline-block;
        padding: 0.3rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .status-active {
        background: #dcfce7;
        color: #166534;
      }
      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }
      .status-suspended {
        background: #fee2e2;
        color: #991b1b;
      }

      /* Actions */
      .action-btns {
        display: flex;
        gap: 0.5rem;
      }
      .btn-action {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: all 0.2s;
      }
      .btn-validate {
        background: #dcfce7;
        color: #166534;
      }
      .btn-validate:hover {
        background: #bbf7d0;
      }
      .btn-suspend {
        background: #fef3c7;
        color: #92400e;
      }
      .btn-suspend:hover {
        background: #fde68a;
      }
      .btn-delete {
        background: #fee2e2;
        color: #991b1b;
      }
      .btn-delete:hover {
        background: #fecaca;
      }
      .btn-action mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--cui-card-bg);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .empty-state h3 {
        color: var(--cui-body-color);
        margin-bottom: 0.5rem;
      }
      .empty-state p {
        color: var(--cui-body-secondary-color);
      }

      @media (max-width: 768px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .filters-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .search-box input {
          width: 100%;
        }
      }
    `,
  ],
})
export class ShopsComponent implements OnInit {
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  loading = true;
  totalShops = 0;
  private platformSettings = inject(PlatformSettingsService);

  selectedStatus = 'all';
  searchTerm = '';

  statusFilters = [
    { value: 'all', label: 'Toutes' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'active', label: 'Actives' },
    { value: 'suspendue', label: 'Suspendues' },
  ];

  constructor(
    private shopService: ShopService,
    private adminService: AdminService,
  ) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.adminService.getShops().subscribe({
      next: (response: any) => {
        if (response.success && response.boutiques) {
          this.shops = response.boutiques;
          this.totalShops = response.total || response.boutiques.length;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilters() {
    let result = [...this.shops];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      result = result.filter((s) => s.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.category?.toLowerCase().includes(term),
      );
    }

    this.filteredShops = result;
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  validateShop(shopId: string, newStatus: string) {
    this.shopService.validateShop(shopId, newStatus).subscribe({
      next: () => {
        this.loadShops();
      },
      error: (err: any) => {
        console.error('Erreur validation boutique:', err);
        alert('Erreur lors de la mise à jour du statut');
      },
    });
  }

  deleteShop(shopId: string) {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.')
    ) {
      return;
    }
    this.shopService.deleteShop(shopId).subscribe({
      next: () => this.loadShops(),
      error: () => alert('Erreur lors de la suppression'),
    });
  }

  countByStatus(status: string): number {
    return this.shops.filter((s) => s.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      active: 'Active',
      suspendue: 'Suspendue',
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return this.platformSettings.formatPrice(amount);
  }
}
