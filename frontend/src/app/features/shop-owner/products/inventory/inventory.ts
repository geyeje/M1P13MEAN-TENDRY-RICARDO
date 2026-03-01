import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Product, ProductService } from '../../../../core/services/product.service';
import { ProductForm } from '../product-form/product-form';
import { ProductList } from '../product-list/product-list';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-inventory',
  imports: [ProductForm, ProductList],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
  productService = inject(ProductService);
  products = signal<Product[]>([]);
  isAdding = signal(false);
  error = signal<string>('');

  ngOnInit(): void {
    this.productService.getMyProducts().subscribe({
      next: (res) =>{
        if(res.success && res.produits)
        this.products.set(res.produits);
      },
      error: (err) =>{
        this.error.set(err);
      }
    })
  }

  toggleMode(){
    this.isAdding.set(!this.isAdding());
  }

  onProductSaved(){
    // A product was created/updated, refresh list and close form
    this.toggleMode();
    this.productService.getMyProducts().subscribe({
      next: (res) => {
        if (res.success && res.produits) this.products.set(res.produits);
      },
      error: (err) => {
        this.error.set(err);
      }
    });
  }
}
