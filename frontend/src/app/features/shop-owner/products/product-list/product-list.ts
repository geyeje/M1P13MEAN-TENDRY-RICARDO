import { Component, inject, input } from '@angular/core';
import { Product, ProductService } from '../../../../core/services/product.service';
import { ProductCard } from '../product-card/product-card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  products = input.required<Product[]>();
}
