import { Component, computed, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ShoppingCartService, CartItem } from '../../../core/services/shopping-cart.service';
import { Product } from '../../../core/services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, ProductCardComponent],
  templateUrl: './product_list.component.html',
  styleUrl: './product_list.component.scss',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(ShoppingCartService);
  categories = signal<string[]>([]);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  selectedCategory = signal<string>('Tous');
  searchTerm = signal<string>('');

  filteredProducts = computed(() => {
    let arr = this.products();
    const searchTermLower = this.searchTerm().toLowerCase().trim();
    if (searchTermLower) {
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTermLower) ||
          p.description?.toLowerCase().includes(searchTermLower)
      );
    }
    const category = this.selectedCategory();
    if (category && category !== 'Tous') {
      arr = arr.filter((p) => p.category === category);
    }
    return arr;
  });

  constructor() {}

  @ViewChild('filters', { read: ElementRef, static: false }) filtersRef?: ElementRef<HTMLDivElement>;

  scrollFilters(delta: number) {
    try {
      this.filtersRef?.nativeElement.scrollBy({ left: delta, behavior: 'smooth' });
    } catch (e) {
      // fallback
      if (this.filtersRef) this.filtersRef.nativeElement.scrollLeft += delta;
    }
  }

  handleAddToCart(product: Product) {
    this.cartService.add(product);
  }

  ngOnInit(): void {
    this.categories.set(this.productService.getCategories());
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products.set(response.produits || []);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set('Failed to load products. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  //Méthode de mise à jour de la catégorie sélectionnée pour le filtrage des produits
  setFilter(cat: string): void {
    this.selectedCategory.set(cat);
  }
}
