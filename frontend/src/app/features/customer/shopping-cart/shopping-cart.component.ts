import { Component, computed, inject } from '@angular/core';
import { ShoppingCartService, CartItem } from '../../../core/services/shopping-cart.service';
import { CartItemComponent } from '../../../shared/components/cart-item/cart-item.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, CartItemComponent, RouterLink, AppCurrencyPipe],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss',
})
export class ShoppingCartComponent {
  cart = inject(ShoppingCartService);
  // Use the service's computed `items` signal directly so `items()` returns the array
  items = this.cart.items;
  total = computed(() =>
    this.cart.items().reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0),
  );
  
  totalItems = computed(() =>
    this.cart.items().reduce((sum, i) => sum + i.quantity, 0),
  );

  remove(productId: string) {
    this.cart.remove(productId);
  }

  updateQty(productId: string, quantity: number) {
    this.cart.updateQuantity(productId, quantity);
  }

  // placeholder for future checkout action
  onValidate() {
    // no-op for now; will trigger checkout flow later
  }
}
