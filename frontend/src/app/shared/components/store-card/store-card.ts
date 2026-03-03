import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Shop } from '../../../core/services/shop.service';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../directives/image-error.directive';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [RouterModule, ImageErrorDirective],
  templateUrl: './store-card.html',
  styleUrl: './store-card.scss',
})
export class StoreCard {
  /** boutique à afficher (peut provenir d'une liste publique) */
  @Input() boutique!: Shop;

  get logoUrl(): string {
    // construct proper URL for image stored in backend
    if (!this.boutique.logo) return 'assets/no-image.png';
    if (this.boutique.logo.startsWith('http')) return this.boutique.logo;
    return `${environment.apiUrl.replace('/api', '')}${this.boutique.logo}`;
  }

  // note moyenne, arrondie à une décimale
  get rating(): string {
    return (this.boutique.avgRating || 0).toFixed(1);
  }
}
