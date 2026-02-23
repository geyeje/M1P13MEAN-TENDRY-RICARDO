import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, ProductCardComponent],
  templateUrl: './product_list.component.html',
  styleUrl: './product_list.component.scss',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]); // tous les produits dans le mock du service pour test d'affichage, à remplacer par un appel réel une fois le backend prêt
  isLoading = signal<boolean>(true); // signal pour gérer l'état de chargement
  errorMessage = signal<string>(''); // Signal pour stocker les messages d'erreurs, non utilisé pour le moment mais à garder pour la suite
  selectedCategory = signal<string>('Tous'); // Signal pour stocker la catégorie sélectionnée pour le filtrage des produits

  //Signal calculé pour filtrer les produits en fonction de la catégorie sélectionnée, réévalué à chaque changement de catégorie ou de liste de produits
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const allProducts = this.products();
    if (category === 'Tous') {
      return allProducts;
    }
    return allProducts.filter((p) => p.category === category);
  });

  constructor() {}

  ngOnInit(): void {
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
