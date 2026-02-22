import { Component } from '@angular/core';
import { ProductListComponent } from '../../shared/components/product_list/product_list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

}
