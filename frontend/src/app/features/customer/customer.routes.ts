import { Routes } from "@angular/router";
import { AuthGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";

export const routes:Routes = [
    {
        path: '',
        canActivate: [AuthGuard, roleGuard],
        data: {role: 'acheteur'},
        children:[
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent:
                ()=> import('./dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'profil',
                loadComponent:
                () => import('./profil/profil').then(m => m.Profil)
            },
            {
                path: 'product-list',
                loadComponent:
                () => import('../../shared/components/product_list/product_list.component').then(m => m.ProductListComponent)
            }
        ]
    }
]