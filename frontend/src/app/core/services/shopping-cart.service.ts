import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private itemsSignal = signal<CartItem[]>(this.load());
  items = computed(() => this.itemsSignal());

  get totalCount() {
    return computed(() => this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0));
  }

  add(product: Product) {
    const list = this.itemsSignal();
    const existing = list.find((i) => i.product._id === product._id);
    if (existing) {
      existing.quantity++;
      this.itemsSignal.set([...list]);
    } else {
      this.itemsSignal.set([...list, { product, quantity: 1 }]);
    }
    this.save();
  }

  updateQuantity(productId: string, quantity: number) {
    const list = this.itemsSignal();
    const item = list.find((i) => i.product._id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.remove(productId);
        return;
      }
      this.itemsSignal.set([...list]);
      this.save();
    }
  }

  remove(productId: string) {
    const filtered = this.itemsSignal().filter((i) => i.product._id !== productId);
    this.itemsSignal.set(filtered);
    this.save();
  }

  clear() {
    this.itemsSignal.set([]);
    this.save();
  }

  private save() {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(this.itemsSignal()));
    } catch {}
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem('shopping_cart');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }
}
