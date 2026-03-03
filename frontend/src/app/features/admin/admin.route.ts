// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.components').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'shops',
        loadComponent: () => import('./shops/shops.component').then((m) => m.ShopsComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('../../shared/components/order-details/order-details').then((m) => m.OrderDetails),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
