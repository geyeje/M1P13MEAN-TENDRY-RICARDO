import { Component, input, output, EventEmitter } from '@angular/core';
import { Product } from '../../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  // InputSignal wraps the value; call `()` to read it.
  item = input.required<CartItem>();
  remove = output<string>();
  quantityChange = output<{ productId: string; quantity: number }>();

  onRemove() {
    this.remove.emit(this.item().product._id);
  }

  changeQty(delta: number) {
    const current = this.item();
    const newQty = current.quantity + delta;
    if (newQty <= 0) {
      this.onRemove();
    } else {
      // do not mutate input; inform parent via output
      this.quantityChange.emit({ productId: current.product._id, quantity: newQty });
    }
  }
}
