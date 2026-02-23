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
    path: '**',
    redirectTo: 'home',
  },
];
