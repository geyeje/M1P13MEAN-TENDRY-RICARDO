import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../../../core/services/product.service';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { HeaderDividerComponent } from '@coreui/angular';
import { environment } from '../../../../../environments/environment';
import { ImageErrorDirective } from '../../../../shared/directives/image-error.directive';

@Component({
  selector: 'app-product-card',
  imports: [AppCurrencyPipe, MatIconModule, ImageErrorDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  // Une approche plus "Gestion" dans ton computed
  discountPercent = computed(() => {
    const p = this.product();
    // On utilise l'accès sécurisé car on sait que l'API peut renvoyer du vide
    if (!p.onSale || !p.promoPrice || p.promoPrice >= p.price) return 0;

    return Math.round(((p.price - p.promoPrice) / p.price) * 100);
  });

  // Ajout d'un signal pour l'état du stock
  stockStatus = computed(() => {
    const s = this.product().stock;
    if (s === 0) return { label: 'Rupture', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (s < 10) return { label: 'Bas', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'OK', color: 'text-green-500', bg: 'bg-green-500/10' };
  });

  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
