import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList implements OnInit {
  orderService = inject(OrderService);

  // Données
  allOrders = signal<Order[]>([]);
  loading = signal(false);

  // Filtres et tri
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');
  sortBy = signal<'date' | 'amount'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal(1);
  pageSize = signal(10);

  // Statuts disponibles pour filtrage
  statusOptions = [
    { value: 'all', label: 'Toutes les commandes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  // Données filtrées et triées
  filteredOrders = computed(() => {
    let result = [...this.allOrders()];

    // Filtrer par statut
    if (this.selectedStatus() !== 'all') {
      result = result.filter((o) => o.status === this.selectedStatus());
    }

    // Filtrer par recherche (numéro de commande)
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter((o) =>
        o.orderNumber.toLowerCase().includes(query),
      );
    }

    // Trier
    if (this.sortBy() === 'date') {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return this.sortOrder() === 'desc' ? dateB - dateA : dateA - dateB;
      });
    } else if (this.sortBy() === 'amount') {
      result.sort((a, b) =>
        this.sortOrder() === 'desc'
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount,
      );
    }

    return result;
  });

  // Données paginées
  paginatedOrders = computed(() => {
    const filtered = this.filteredOrders();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  // Informations de pagination
  totalFiltered = computed(() => this.filteredOrders().length);
  totalPages = computed(() =>
    Math.ceil(this.totalFiltered() / this.pageSize()),
  );

  // Array pour boucle des pages
  pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    console.log('🔄 Chargement des commandes...');
    // Charger TOUTES les commandes sans limite
    this.orderService.getMyOrders({ limit: 1000, page: 1 }).subscribe({
      next: (resp) => {
        console.log('✅ Réponse API reçue:', resp);
        if (resp.commandes && resp.commandes.length > 0) {
          console.log(`📦 ${resp.commandes.length} commande(s) trouvée(s):`, resp.commandes);
          this.allOrders.set(resp.commandes);
        } else {
          console.warn('⚠️ Aucune commande trouvée dans la réponse', resp);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des commandes:', err);
        this.loading.set(false);
      },
    });
  }

  // Méthodes de filtrage/tri
  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1); // Reset pagination
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onSortChange(sortBy: 'date' | 'amount'): void {
    if (this.sortBy() === sortBy) {
      // Toggle sort order si même colonne cliquée
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('desc');
    }
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Helpers
  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }
}
