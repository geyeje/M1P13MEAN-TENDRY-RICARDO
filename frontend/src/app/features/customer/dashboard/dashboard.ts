import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService, User } from '../../../core/services/auth.service';
import { OrderService, Order } from '../../../core/services/order.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);

  currentUser = signal<User | null>(null);
  orders = signal<Order[]>([]);
  ordersCount = signal<number>(0);
  productsRated = signal<number>(0); // placeholder; will come from rating service

  ngOnInit(): void {
    const stringUser = localStorage.getItem('currentUser');
    if (stringUser) {
      this.currentUser.set(JSON.parse(stringUser));
    }
    // fetch recent orders & total count
    this.orderService.getMyOrders({ limit: 5, page: 1 }).subscribe({
      next: (resp) => {
        if (resp.commandes) {
          this.orders.set(resp.commandes);
        }
        if (typeof resp.count === 'number') {
          this.ordersCount.set(resp.count);
        }
      },
      error: () => {
        // ignore for now
      },
    });
  }
}
