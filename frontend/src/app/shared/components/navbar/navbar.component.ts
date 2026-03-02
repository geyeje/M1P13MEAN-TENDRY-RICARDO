import { Component, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { AsyncPipe } from '@angular/common';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class Navbar {
  authService = inject(AuthService);// Injection du service d'authentification
  cart = inject(ShoppingCartService);
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
}
