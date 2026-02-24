import { computed, inject, Injectable } from '@angular/core';
import { ProductService } from './product.service';
import { map, reduce } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../core/services/product.service';

@Injectable({
  providedIn: 'root',
})
export class ShopData {
  productService = inject(ProductService);
  products = toSignal(this.productService.getMyProducts().pipe(map(response => response.produits)), {initialValue: [] as Product[]});
  
  totalRevenue = computed(() => {
    this.products()?.reduce((acc, p) => acc + (p.promoPrice ?? p.price) * (p.salesCount ?? 0), 0);
  });

  totalSales = computed(() =>{
    this.products()?.reduce((acc, p) => acc + (p.salesCount ?? 0), 0);

  })

  lowStockCount = computed(() =>{
    this.products()?.filter(p => p.stock <5)?.length ?? 0;
  })
}
