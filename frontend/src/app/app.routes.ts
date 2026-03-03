// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { AuthLayout } from './core/layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
        .then((m) => m.HomeComponent),
      },
      {
        path: 'store',
        canActivate: [AuthGuard],
        data: { roles: ['boutique'] },
        loadChildren: () => import('./features/store/store.routes')
        .then((m) => m.routes),
      },
      {
        path: 'shopping-cart',
        redirectTo: 'customer/shopping-cart',
        pathMatch: 'full'
      },
      {
        path: 'customer',
        canActivate: [AuthGuard],
        data: { roles: ['acheteur']},
        loadChildren: () => import('./features/customer/customer.routes')
        .then((m)=> m.routes)
      },
      {
        path: 'checkout',
        canActivate: [AuthGuard],
        data: {roles: ['acheteur']},
        loadComponent: () => import('./shared/checkout-component/checkout-component')
        .then((m) => m.CheckoutComponent),
      },
      {
        path: 'product-list',
        loadComponent: () => import('./features/customer/product_list/product_list.component')
        .then((m) => m.ProductListComponent),
      },
      {
        path: 'store-list',
        loadComponent: () => import('./shared/components/store-list/store-list')
        .then((m) => m.StoreList),
      },
      {
        path: 'boutique/:id',
        loadComponent: () => import('./features/customer/store-detail/store-detail.component')
        .then((m) => m.StoreDetail),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./shared/components/product-details/product-details')
        .then((m) => m.ProductDetails),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./shared/components/unauthorized/unauthorized.component').then(
            (m) => m.UnauthorizedComponent,
          ),
      },
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component')
        .then((m) => m.RegisterComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component')
        .then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./coreui-layout/default-layout/default-layout.component').then(
        (m) => m.DefaultLayoutComponent,
      ),
    loadChildren: () => import('./features/admin/admin.route').then((m) => m.adminRoutes),
  },
  
  {
    path: 'shop-owner',
    canActivate: [AuthGuard],
    // data: { roles: ['admin', 'boutique'] },
    loadComponent: () => import('./features/shop-owner/layout/shop-layout/shop-layout')
      .then(m => m.ShopLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/shop-owner/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'my-shop',
        loadComponent: () => import('./features/shop-owner/my-shop/my-shop')
          .then(m => m.MyShopComponent)
      },
      // route list imported from shop-owner.route.ts for deeper pages
      {
        path: '',
        loadChildren: () => import('./features/shop-owner/shop-owner.route').then((m) => m.shopOwnerRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
