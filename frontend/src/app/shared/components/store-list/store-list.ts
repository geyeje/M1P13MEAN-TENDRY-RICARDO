import { Component, computed, inject, signal, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { StoreCard } from '../store-card/store-card';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [
    // Angular built-ins
    CommonModule,
    FormsModule,
    MatIconModule,
    // child components
    StoreCard,
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.scss',
})
export class StoreList implements OnInit {
  private shopService = inject(ShopService);

  boutiques = signal<Shop[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  searchTerm = signal<string>('');
  selectedCategory = signal<string>('Tous');
  categories = signal<string[]>([]);

  filteredBoutiques = computed(() => {
    let arr = this.boutiques();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      arr = arr.filter(
        (b) =>
          b.name.toLowerCase().includes(term) || b.category.toLowerCase().includes(term),
      );
    }
    const cat = this.selectedCategory();
    if (cat && cat !== 'Tous') {
      arr = arr.filter((b) => b.category === cat);
    }
    return arr;
  });

  @ViewChild('filters', { read: ElementRef, static: false }) filtersRef?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    // initialize categories
    this.categories.set(this.shopService.getCategories());
    // initial load - all shops
    this.loadShops();
  }

  private loadShops(): void {
    this.isLoading.set(true);
    this.shopService.getAllShops().subscribe({
      next: (res: any) => {
        if (res && res.boutiques) {
          this.boutiques.set(res.boutiques);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('Impossible de charger les boutiques.');
        this.isLoading.set(false);
      },
    });
  }

  // Method to apply local filtering based on search/category
  applyFilters(): void {
    // Local filtering - no need for API call
    // filteredBoutiques computed will automatically recompute
  }

  setFilter(cat: string): void {
    this.selectedCategory.set(cat);
  }

  scrollFilters(delta: number) {
    try {
      this.filtersRef?.nativeElement.scrollBy({ left: delta, behavior: 'smooth' });
    } catch (e) {
      if (this.filtersRef) this.filtersRef.nativeElement.scrollLeft += delta;
    }
  }
}
