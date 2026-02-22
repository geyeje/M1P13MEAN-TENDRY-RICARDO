import { Routes } from "@angular/router";
import { StoreComponent } from "./store.component";
import { ShopLayout } from "../shop-owner/layout/shop-layout/shop-layout";

export const routes: Routes = [{
    path: 'store',
    component: ShopLayout,
    children: [
        {
            path: '',
            component: StoreComponent
        }
    ]
}]