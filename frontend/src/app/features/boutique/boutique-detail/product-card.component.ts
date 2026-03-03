// src/app/features/boutiques/boutique-detail/product-card.component.ts
import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/services/product.service';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ImageErrorDirective],
  template: `
    <div class="product-card" [routerLink]="['/products', product()._id]">
      <div class="product-image-container">
        <img 
          [src]="getImageUrl(product().images[0])" 
          [alt]="product().name"
          class="product-image"
          appImageError
        />
        @if (product().onSale) {
          <div class="promo-badge">
            -{{ discountPercent() }}%
          </div>
        }
        @if (product().featured) {
          <div class="featured-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        }
      </div>

      <div class="product-content">
        <h4 class="product-title">{{ product().name }}</h4>
        
        <div class="product-price">
          @if (product().onSale && product().promoPrice) {
            <span class="price-promo">{{ product().promoPrice | currency:'EUR' }}</span>
            <span class="price-original">{{ product().price | currency:'EUR' }}</span>
          } @else {
            <span class="price-regular">{{ product().price | currency:'EUR' }}</span>
          }
        </div>

        <div class="product-stock" [class]="'stock-' + stockStatus().toLowerCase()">
          <span class="stock-indicator"></span>
          {{ stockStatus() }} : {{ product().stock }} unités
        </div>

        <div class="product-stats">
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
            </svg>
            <span>{{ product().salesCount }} vendus</span>
          </div>
          
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{{ product().avgRating.toFixed(1) }}/5</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: var(--cui-card-bg);
      border: 1px solid var(--cui-border-color);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        border-color: var(--cui-primary);
      }
    }

    .product-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: var(--cui-tertiary-bg);
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;

      .product-card:hover & {
        transform: scale(1.05);
      }
    }

    .promo-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 4px 8px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.875rem;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }

    .featured-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 6px;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .product-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-title {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cui-body-color);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .price-regular {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--cui-body-color);
    }

    .price-promo {
      font-size: 1.25rem;
      font-weight: 700;
      color: #10b981;
    }

    .price-original {
      font-size: 0.875rem;
      color: var(--cui-secondary-color);
      text-decoration: line-through;
    }

    .product-stock {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 0.875rem;
      font-weight: 500;

      .stock-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.stock-ok {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;

        .stock-indicator {
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
      }

      &.stock-bas {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;

        .stock-indicator {
          background: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }
      }

      &.stock-rupture {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;

        .stock-indicator {
          background: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
      }
    }

    .product-stats {
      display: flex;
      gap: 16px;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid var(--cui-border-color);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: var(--cui-secondary-color);

      svg {
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class ProductCardComponent {
  product = input.required<Product>();

  discountPercent = computed(() => {
    const p = this.product();
    if (!p.onSale || !p.promoPrice || p.promoPrice >= p.price) return 0;
    return Math.round(((p.price - p.promoPrice) / p.price) * 100);
  });

  stockStatus = computed(() => {
    const stock = this.product().stock;
    if (stock === 0) return 'Rupture';
    if (stock < 10) return 'Bas';
    return 'OK';
  });

  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}