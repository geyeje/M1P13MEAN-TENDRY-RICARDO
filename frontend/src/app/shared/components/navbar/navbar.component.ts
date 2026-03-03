import { Component, computed, inject, input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../directives/image-error.directive';

interface MenuItem {
  icon?: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    CommonModule,
    ImageErrorDirective,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class Navbar {
  authService = inject(AuthService);
  cart = inject(ShoppingCartService);
  router = inject(Router);

  currentUser = toSignal(this.authService.currentUser$);
  name = computed(() => this.currentUser()?.prenom || 'Utilisateur');
  cartCount = computed(() => this.cart.items().reduce((sum, i) => sum + i.quantity, 0));

  menuItem = input<MenuItem[]>([
    { label: 'Accueil', route: 'home' },
    { label: 'Produits', route: '/product-list' },
    { label: 'Boutiques', route: '/store-list' },
    { label: 'Commandes', route: '/customer/order-list' },
  ]);

  readonly title = 'MATCHA';
  readonly Logo = 'M';
  readonly environment = environment;

  getAvatarUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  goToDashboard(): void {
    const role = this.authService.currentUserValue?.role;
    const routeMap: Record<string, string> = {
      admin: '/admin/dashboard',
      boutique: '/shop-owner/dashboard',
      acheteur: '/customer/dashboard',
      customer: '/customer/dashboard',
    };
    const route = routeMap[role || 'customer'] || '/customer/dashboard';
    this.router.navigate([route]);
  }
}
