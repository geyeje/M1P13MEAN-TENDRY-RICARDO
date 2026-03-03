// src/app/features/boutiques/boutiques-list/boutiques-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop.service';
import { BoutiqueCardComponent } from './boutique-card.component';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueCardComponent],
  templateUrl: './boutiques-list.component.html',
  styleUrls: ['./boutiques-list.component.scss'],
})
export class BoutiquesListComponent implements OnInit {
  private shopService = inject(ShopService);

  boutiques: Shop[] = [];
  filteredBoutiques: Shop[] = [];
  loading = true;
  error: string | null = null;

  // Filtres
  categories: string[] = [
    'Mode & Vêtements',
    'Électronique & High-tech',
    'Alimentation & Boissons',
    'Beauté & Cosmétiques',
    'Sport & Loisirs',
    'Maison & Décoration',
    'Livres & Culture',
    'Jouets & Enfants',
    'Santé & Bien-être',
    'Bijouterie & Accessoires',
    'Services',
    'Autres',
  ];
  selectedCategory = '';
  searchTerm = '';
  sortBy: 'name' | 'createdAt' | 'note' = 'createdAt';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalBoutiques = 0;
  limit = 12;

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      sort: this.sortBy === 'createdAt' ? '-createdAt' : this.sortBy === 'note' ? '-note' : 'name',
    };

    if (this.selectedCategory) {
      params.category = this.selectedCategory;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.shopService.getAllShops(params).subscribe({
      next: (response) => {
        this.boutiques = response.boutiques || [];
        this.filteredBoutiques = response.boutiques || [];
        this.totalPages = response.totalPages || 1;
        this.totalBoutiques = response.total || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement boutiques:', err);
        this.error = 'Impossible de charger les boutiques. Veuillez réessayer.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBoutiques();
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.sortBy = 'createdAt';
    this.currentPage = 1;
    this.loadBoutiques();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBoutiques();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
