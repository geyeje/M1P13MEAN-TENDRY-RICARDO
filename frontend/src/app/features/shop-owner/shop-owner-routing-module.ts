import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { ShopLayout } from './layout/shop-layout/shop-layout';
const routes: Routes = [
  {
    path: '',
    component: ShopLayout,
    children: [
      {
        path: '',
        canActivate: [AuthGuard, roleGuard],
        data: { role: 'store' },
        loadComponent: () => import('./layout/shop-layout/shop-layout').then((m) => m.ShopLayout),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
          },
          {
            path: 'create-shop',
            loadComponent: () => import('./create-shop/create-shop').then((m) => m.CreateShop),
          },
          {
            path: 'my-shop',
            loadComponent: () => import('./my-shop/my-shop').then((m) => m.MyShopComponent),
          },
          {
            path: 'edit-shop',
            loadComponent: () => import('./edit-shop/edit-shop').then((m) => m.EditShop),
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./products/product-list/product-list').then(
                (m) => m.ShopProductListComponent,
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopOwnerRoutingModule {}
