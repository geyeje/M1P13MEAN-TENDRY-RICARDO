import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShopService } from '../../../core/services/shop';

interface SimpleNavItem {
  icon?: string;
  label?: string;
  name?: string;
  route?: string;
  url?: string;
  badge?: number;
  iconComponent?: any;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class Sidebar {
  authService = inject(AuthService);
  shopService = inject(ShopService);
  currentUser = toSignal(this.authService.currentUser$);
  name = computed(() => this.currentUser()?.prenom || 'invité');

  // Inputs/outputs (standalone signal helpers)
  isOpen = input<boolean>(true);
  toggleSidebar = output();

  // accept arbitrary nav item arrays (could be INavData or simple objects)
  navItems = input<any[]>([]);

  // normalized items for template: {label, route, icon, badge}
  items = computed(() => {
    const raw = this.navItems?.() || [];
    return raw.map((r: any) => {
      const label = r.label?.toString() || r.name?.toString() || '';
      const route = r.route || r.url || '';
      const icon = r.icon || r.iconComponent?.name || '';
      return { label, route, icon, badge: r.badge };
    });
  });

  logout() {
    this.authService.logout();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
