import { Component, input, output, signal } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar.component';
import { customerNavItems } from '../_nav';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout {
  isSidebar = true;
  menuItems = signal(customerNavItems);

  onToggleSidebar(){
    this.isSidebar = !this.isSidebar;
  }
}
