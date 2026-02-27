import { Component, computed, input, output, Pipe, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe} from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, MatCardModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToShoppingCart = output<Product>();

  private authService = inject(AuthService);
  private router = inject(Router);

  onAddToShoppingCart(p: Product){
    if (!this.authService.isLoggedIn) {
      // not logged-in, redirect to login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/shopping-cart' }
      });
      return;
    }
    this.addToShoppingCart.emit(p);
  }
}
