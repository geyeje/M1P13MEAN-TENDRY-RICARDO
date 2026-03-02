import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Shop } from '../../../core/services/Shop.service';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './store-card.html',
  styleUrl: './store-card.scss',
})
export class StoreCard {
  /** boutique à afficher (peut provenir d'une liste publique) */
  @Input() boutique!: Shop;

  get logoUrl(): string {
    // reuse the same placeholder as product cards
    return this.boutique.logo || 'assets/no-image.png';
  }

  // note moyenne, arrondie à une décimale
  get rating(): string {
    return (this.boutique.avgRating || 0).toFixed(1);
  }
}
