import { Routes } from "@angular/router";
import { StoreComponent } from "./store.component";
import { ShopLayout } from "../shop-owner/layout/shop-layout/shop-layout";
import { Dashboard } from "../shop-owner/dashboard/dashboard";
import { ProductList } from "../shop-owner/products/product-list/product-list";

export const routes: Routes = [{
    path: 'store',
    component: ShopLayout,
    children: [
        {
            path: '',
            component: StoreComponent
        },
        {path:'dashboard', component: Dashboard},
        {path: 'products', component: ProductList}
    ]
}]