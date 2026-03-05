import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const shopOwnerRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, roleGuard],
    data: { role: 'store' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'create-shop', // ← NOUVEAU
        loadComponent: () => import('./create-shop/create-shop').then((m) => m.CreateShop),
      },

      {
        path: 'edit-shop',
        loadComponent: () => import('./edit-shop/edit-shop').then((m) => m.EditShop),
      },
      {
        path: 'my-shop',
        loadComponent: () => import('./my-shop/my-shop').then((m) => m.MyShopComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-list/product-list').then((m) => m.ShopProductListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./products/product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./products/product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/order-list/order-list').then((m) => m.ShopOwnerOrderList),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/order-detail/order-detail').then((m) => m.OrderDetail),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings').then((m) => m.SettingsComponent),
      },
    ],
  },
];
