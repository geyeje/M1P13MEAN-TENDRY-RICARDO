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
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.components')
          .then(m => m.DashboardComponent)
      },
      // Futures routes
      // {
      //   path: 'users',
      //   loadComponent: () => import('./users/users.component')
      //     .then(m => m.UsersComponent)
      // },
      // {
      //   path: 'shops',
      //   loadComponent: () => import('./shops/shops.component')
      //     .then(m => m.ShopsComponent)
      // }
    ]
  }
];