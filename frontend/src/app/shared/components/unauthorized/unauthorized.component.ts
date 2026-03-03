import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
})
export class UnauthorizedComponent {
  user: User | null;

  constructor(private auth: AuthService, private router: Router) {
    this.user = this.auth.currentUserValue;
  }

  private getDefaultRouteForRole(role?: string | null): string {
    if (!role) return '/';
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'boutique':
        return '/shop-owner/dashboard';
      case 'acheteur':
        return '/';
      default:
        return '/';
    }
  }

  goToDefault(): void {
    const route = this.getDefaultRouteForRole(this.user?.role ?? null);
    this.router.navigate([route]);
  }

}
