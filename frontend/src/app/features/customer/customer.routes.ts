import { Routes } from "@angular/router";
import { AuthGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";
import { CustomerLayout } from "./customer-layout/customer-layout";

export const routes:Routes = [
    {
        path: '',
        component: CustomerLayout,
        canActivate: [AuthGuard, roleGuard],
        data: {role: 'acheteur'},
        children:[
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent:
                ()=> import('./dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'shopping-cart',
                loadComponent:
                ()=> import('./shopping-cart/shopping-cart.component').then(m => m.ShoppingCartComponent)
            },
            {
                path: 'order-list',
                loadComponent:
                ()=> import('./order-list/order-list').then(m => m.OrderList)
            },
            {
                path: 'order/:id',
                loadComponent:
                  () => import('../../shared/components/order-details/order-details').then(m => m.OrderDetails)
            },
            {
                path: 'order-history',
                loadComponent:
                ()=> import('./order-history/order-history').then(m => m.OrderHistory)
            },
            {
                path: 'profil',
                loadComponent:
                () => import('./profil/profil').then(m => m.Profil)
            }
        ]
    }
]