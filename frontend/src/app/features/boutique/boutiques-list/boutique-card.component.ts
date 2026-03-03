// src/app/features/boutiques/boutiques-list/boutique-card.component.ts
import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { ShopService, Shop } from '../../../core/services/shop.service';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-boutique-card',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe, ImageErrorDirective],
  template: `
    <div class="boutique-card" [routerLink]="['/boutiques', boutique()._id]">
      <!-- Banner -->
      <div class="boutique-banner">
        @if (boutique().banner) {
          <img
            [src]="getImageUrl(boutique().banner)"
            [alt]="boutique().name"
            class="banner-img"
            appImageError
          />
        } @else {
          <div class="banner-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        }

        <!-- Logo -->
        <div class="boutique-logo-wrapper">
          @if (boutique().logo) {
            <img
              [src]="getImageUrl(boutique().logo)"
              [alt]="boutique().name"
              class="boutique-logo"
              appImageError
            />
          } @else {
            <div class="boutique-logo logo-placeholder">
              {{ boutique().name.charAt(0) }}
            </div>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="boutique-content">
        <div class="boutique-header">
          <h3 class="boutique-name">{{ boutique().name }}</h3>
          @if (boutique().featured) {
            <span class="featured-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
              Vedette
            </span>
          }
        </div>

        <span class="boutique-category">{{ boutique().category }}</span>

        <p class="boutique-description">{{ boutique().description | slice: 0 : 120 }}...</p>

        <!-- Stats -->
        <div class="boutique-stats">
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
              />
            </svg>
            <span>{{ boutique().productCount }} produits</span>
          </div>

          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <span>{{ boutique().note.toFixed(1) }}/5 ({{ boutique().reviewCount }})</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="boutique-footer">
          <span class="boutique-since">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {{ boutique().createdAt | date: 'MMM yyyy' }}
          </span>

          <button class="btn-visit">Voir la boutique</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .boutique-card {
        background: var(--cui-card-bg);
        border: 1px solid var(--cui-border-color);
        border-radius: 16px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--cui-primary);
        }
      }

      .boutique-banner {
        position: relative;
        height: 160px;
        background: linear-gradient(135deg, var(--cui-primary) 0%, var(--cui-secondary) 100%);
        overflow: hidden;
      }

      .banner-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;

        .boutique-card:hover & {
          transform: scale(1.05);
        }
      }

      .banner-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: rgba(255, 255, 255, 0.5);

        svg {
          width: 48px;
          height: 48px;
        }
      }

      .boutique-logo-wrapper {
        position: absolute;
        bottom: -40px;
        left: 20px;
        border-radius: 12px;
        overflow: hidden;
        border: 4px solid var(--cui-card-bg);
        background: var(--cui-card-bg);
      }

      .boutique-logo {
        width: 80px;
        height: 80px;
        object-fit: cover;
        display: block;

        &.logo-placeholder {
          background: linear-gradient(135deg, var(--cui-primary) 0%, var(--cui-secondary) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }
      }

      .boutique-content {
        padding: 48px 20px 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .boutique-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .boutique-name {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--cui-body-color);
      }

      .featured-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .boutique-category {
        display: inline-block;
        padding: 4px 12px;
        background: var(--cui-tertiary-bg);
        border-radius: 20px;
        font-size: 0.75rem;
        color: var(--cui-secondary-color);
        margin-bottom: 12px;
        align-self: flex-start;
      }

      .boutique-description {
        color: var(--cui-secondary-color);
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 16px;
        flex: 1;
      }

      .boutique-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        padding-top: 16px;
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

      .boutique-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
      }

      .boutique-since {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: var(--cui-secondary-color);

        svg {
          width: 14px;
          height: 14px;
        }
      }

      .btn-visit {
        background: linear-gradient(135deg, var(--cui-primary) 0%, var(--cui-secondary) 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--cui-primary-rgb), 0.3);
        }
      }
    `,
  ],
})
export class BoutiqueCardComponent {
  private shopService = inject(ShopService);
  boutique = input.required<Shop>();

  getImageUrl(path: string | null | undefined): string {
    return this.shopService.getImageUrl(path);
  }
}
