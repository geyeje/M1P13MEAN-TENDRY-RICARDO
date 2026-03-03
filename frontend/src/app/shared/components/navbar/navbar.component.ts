import { Component, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from "@angular/router";
import { AsyncPipe, CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../directives/image-error.directive';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, AsyncPipe, CommonModule, ImageErrorDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class Navbar {
  authService = inject(AuthService);// Injection du service d'authentification
  cart = inject(ShoppingCartService);
  currentUser = toSignal(this.authService.currentUser$);
  name = computed(() => this.currentUser()?.prenom || 'invité');
  cartCount = computed(() => this.cart.items().reduce((sum, i) => sum + i.quantity, 0));
  menuItem = input<MenuItem[]>([
    { icon: '', label: 'Accueil', route: 'home' },
    { icon: '', label: 'nos produits', route: '/customer/product-list' },
    { icon: '', label: 'commandes', route: '/customer/order' },
    { icon: '', label: 'profil', route: '/customer/dashboard', badge: 0 },
    { icon: '', label: 'Paramètres', route: '/customer/settings' },
  ]);

  title: string = ('Matcha').toLocaleUpperCase();
  Logo: any = 'M';
  environment = environment;

  getAvatarUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  router = inject(Router);

  goToDashboard(): void {
    const role = this.authService.currentUserValue?.role;
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'boutique') {
      this.router.navigate(['/shop-owner/dashboard']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
