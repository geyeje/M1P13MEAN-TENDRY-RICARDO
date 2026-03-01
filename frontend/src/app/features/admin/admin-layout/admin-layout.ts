import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  isSidebarOpen = true;
  user$: Observable<User | null>;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'users', label: 'Utilisateurs', route: '/admin/users' },
    { icon: 'shop', label: 'Boutiques', route: '/admin/shops' },
    { icon: 'package', label: 'Produits', route: '/admin/products' },
    { icon: 'shopping-cart', label: 'Commandes', route: '/admin/orders' },
    { icon: 'settings', label: 'Paramètres', route: '/admin/settings' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
