import { Component, inject, signal, Signal } from '@angular/core';
import { ProductListComponent } from '../../customer/product_list/product_list.component';
import { Product, ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  productService = inject(ProductService);
  product: Signal<Product[]> = signal<Product[]>([]);
}
