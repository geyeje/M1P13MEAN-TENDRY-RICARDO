// src/app/features/shop-owner/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderService, Order } from '../../../core/services/order.service';
import { StatWidget } from '../components/stat-widget/stat-widget';
import { RecentOrdersWidgetComponent} from '../components/recent-orders-widget/recent-orders-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatWidget,
    RecentOrdersWidgetComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {

}
