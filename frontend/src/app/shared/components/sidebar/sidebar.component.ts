import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShopService } from '../../../core/services/shop';
import { ProductService } from '../../../core/services/product.service';
import { ImageErrorDirective } from '../../directives/image-error.directive';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule, RouterModule, ImageErrorDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class Sidebar {
  authService = inject(AuthService);
  shopService = inject(ShopService);
  productService = inject(ProductService);
  currentUser = toSignal(this.authService.currentUser$);
  name = computed(() => this.currentUser()?.prenom || 'invité');

  // Inputs/outputs (standalone signal helpers)
  isOpen = input<boolean>(true);
  toggleSidebar = output();

  // featured content signals
  featuredShops = signal<any[]>([]);
  featuredProducts = signal<any[]>([]);

  logout() {
    this.authService.logout();
  }

  getAvatarUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  environment = environment;

  constructor() {
    // fetch featured data immediately
    this.shopService.getFeaturedShops(5).subscribe((res: any) => {
      if (res?.boutiques) {
        this.featuredShops.set(res.boutiques);
      }
    });
    this.productService.getFeaturedProducts(5).subscribe((res: any) => {
      if (res?.produits) {
        this.featuredProducts.set(res.produits);
      }
    });
  }
}
