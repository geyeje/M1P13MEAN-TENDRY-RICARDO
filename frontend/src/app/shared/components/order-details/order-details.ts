import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../../core/services/order.service';
import { environment } from '../../../../environments/environment';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID commande manquant');
      return;
    }

    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        if (res && res.commande) {
          this.order.set(res.commande as Order);
        } else {
          this.error.set(res.message || 'Commande introuvable');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Erreur lors de la récupération');
        this.loading.set(false);
      },
    });
  }

  goBack() {
    const user = this.authService.currentUserValue;
    if (user?.role === 'admin') {
      this.router.navigate(['/admin/orders']);
    } else if (user?.role === 'boutique') {
      this.router.navigate(['/shop-owner/orders']);
    } else {
      this.router.navigate(['/customer/order-list']);
    }
  }

  getImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = environment.apiUrl.replace('/api', '');
    // ensure there's a leading slash between base and path
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return `${base}${normalizedPath}`;
  }
}
