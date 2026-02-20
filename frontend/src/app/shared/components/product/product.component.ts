import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CurrencyPipe, MatButtonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  selectedCategory = signal<string>('tous');
  filteredProducts = computed(() =>{
    const category = this.selectedCategory();
    const allProducts = this.products();
    if(category === 'Tous'){
      return allProducts;
    }
    return allProducts.filter(p => p.category === category);
  });

  constructor(){};

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) =>{
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) =>{
        this.errorMessage.set('Failed to load products. Please try again later.');
        this.isLoading.set(false);
      }
    })
  }

  setFilter(cat: string): void{
    this.selectedCategory.set(cat);
  }
}
  
