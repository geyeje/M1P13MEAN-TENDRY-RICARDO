import { Routes } from '@angular/router';
import { StoreComponent } from './store.component';
import { ShopLayout } from '../shop-owner/layout/shop-layout/shop-layout';
import { DashboardComponent } from '../shop-owner/dashboard/dashboard';
import { ProductListComponent } from '../shop-owner/products/product-list/product-list';

export const routes: Routes = [
  {
    path: 'store',
    component: ShopLayout,
    children: [
      {
        path: '',
        component: StoreComponent,
      },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductListComponent },
    ],
  },
];
