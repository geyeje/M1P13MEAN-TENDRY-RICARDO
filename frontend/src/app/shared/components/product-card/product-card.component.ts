import { Component, computed, input, output, Pipe, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../directives/image-error.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatIconModule, AppCurrencyPipe, MatCardModule, ImageErrorDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToShoppingCart = output<Product>();

  private authService = inject(AuthService);
  private router = inject(Router);

  onAddToShoppingCart(p: Product) {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/shopping-cart' },
      });
      return;
    }
    this.addToShoppingCart.emit(p);
  }

  onViewDetails(p: Product) {
    this.router.navigate(['/product', p._id]);
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
