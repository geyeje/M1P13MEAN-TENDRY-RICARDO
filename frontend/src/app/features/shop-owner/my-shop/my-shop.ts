// src/app/features/shop-owner/my-shop/my-shop.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/Shop.service';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-shop.html',
  styleUrls: ['./my-shop.scss']
})
export class MyShopComponent implements OnInit {
  shop: Shop | null = null;
  loading = true;
  error = '';

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.loadShop();
  }

  loadShop() {
    this.loading = true;
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          this.shop = response.boutique;
        } else {
          this.error = 'Boutique non trouvée';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement boutique:', error);
        this.error = error.error?.message || 'Erreur lors du chargement de la boutique';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente de validation',
      'active': 'Active',
      'suspendue': 'Suspendue'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'en_attente': 'status-warning',
      'active': 'status-success',
      'suspendue': 'status-danger'
    };
    return classes[status] || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}