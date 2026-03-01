// src/app/features/shop-owner/products/product-list/product-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = 'all';

  categories = [
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
    'Autres'
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getMyProducts().subscribe({
      next: (response) => {
        if (response.success && response.produits) {
          this.products = response.produits;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  get filteredProducts() {
    return this.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  deleteProduct(id: string, name: string) {
    if (confirm(`Supprimer "${name}" ?`)) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  updateStock(productId: string, operation: 'add' | 'subtract') {
    const quantity = prompt(`Quantité à ${operation === 'add' ? 'ajouter' : 'retirer'} ?`);
    if (quantity && !isNaN(Number(quantity))) {
      this.productService.updateStock(productId, { 
        quantity: Number(quantity), 
        operation 
      }).subscribe({
        next: () => this.loadProducts(),
        error: () => alert('Erreur mise à jour stock')
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}