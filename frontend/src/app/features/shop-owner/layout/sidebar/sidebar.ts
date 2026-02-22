import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/shop-owner/dashboard' },
    { icon: '🏪', label: 'Ma Boutique', route: '/shop-owner/my-shop' },
    { icon: '📦', label: 'Produits', route: '/shop-owner/products' },
    { icon: '🛒', label: 'Commandes', route: '/shop-owner/orders', badge: 0 },
    { icon: '⚙️', label: 'Paramètres', route: '/shop-owner/settings' },
  ];
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.user$ = this.authService.currentUser$;
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
