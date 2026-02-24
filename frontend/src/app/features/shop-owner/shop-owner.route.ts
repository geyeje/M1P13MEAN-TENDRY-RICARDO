import { Routes } from "@angular/router";
import { AuthGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";

export const shopOwnerRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard, roleGuard],
        data: { role: 'store' },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: 
                () => import('./dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'products',
                loadComponent: 
                () => import('./products/product-list/product-list').then(m => m.ProductList)
            },
            {
                path: 'edit-shop',
                loadComponent:
                () => import('./edit-shop/edit-shop').then(m => m.EditShop)
            },
            {
                path: 'orders',
                loadComponent:
                () => import('./orders/order-list/order-list').then(m => m.OrderList)
            }
        ]
    }
]