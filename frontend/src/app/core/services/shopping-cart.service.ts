import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Product } from './product.service';
import { AuthService } from './auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private itemsSignal = signal<CartItem[]>([]);
  items = computed(() => this.itemsSignal());

  constructor(private auth: AuthService) {
    // Initialize from storage for current user/guest
    this.itemsSignal.set(this.load());

    // Listen to auth changes: when user logs out -> clear cart; when logs in -> load their cart
    this.auth.currentUser$.subscribe((user) => {
      if (!user) {
        // user logged out: clear the in-memory cart and remove stored cart for guest (keep guest separate)
        this.itemsSignal.set([]);
        this.save();
      } else {
        // user logged in: load cart for this user
        this.itemsSignal.set(this.load());
      }
    });
  }

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

  private storageKey(): string {
    const user = this.auth.currentUserValue;
    if (user && user.id) return `shopping_cart_${user.id}`;
    return 'shopping_cart_guest';
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.itemsSignal()));
    } catch {}
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }
}
