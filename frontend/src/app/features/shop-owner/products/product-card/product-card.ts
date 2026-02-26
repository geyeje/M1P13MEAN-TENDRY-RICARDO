import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../../../core/services/product.service';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderDividerComponent } from "@coreui/angular";

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, MatIconModule],
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
}
