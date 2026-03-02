import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: 'speedometer', label: 'Dashboard', route: '/shop-owner/dashboard' },
    { icon: 'home', label: 'Ma Boutique', route: '/shop-owner/my-shop' },
    { icon: 'storage', label: 'Produits', route: '/shop-owner/products' },
    { icon: 'cart', label: 'Commandes', route: '/shop-owner/orders', badge: 0 },
    { icon: 'settings', label: 'Paramètres', route: '/shop-owner/settings' },
  ];
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {
    this.user$ = this.authService.currentUser$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
  }
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
