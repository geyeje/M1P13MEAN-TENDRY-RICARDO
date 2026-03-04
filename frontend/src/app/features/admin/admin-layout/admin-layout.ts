import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MatIconModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  isSidebarOpen = true;
  user$: Observable<User | null>;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard', color: '#3b82f6' }, // Blue
    { icon: 'people', label: 'Utilisateurs', route: '/admin/users', color: '#8b5cf6' }, // Purple
    { icon: 'storefront', label: 'Boutiques', route: '/admin/shops', color: '#10b981' }, // Emerald
    { icon: 'inventory_2', label: 'Produits', route: '/admin/products', color: '#f59e0b' }, // Amber
    { icon: 'shopping_cart', label: 'Commandes', route: '/admin/orders', color: '#ef4444' }, // Red
    { icon: 'settings', label: 'Paramètres', route: '/admin/settings', color: '#6366f1' }, // Indigo
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
