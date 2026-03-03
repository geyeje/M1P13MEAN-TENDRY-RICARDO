import { Component, input, output, signal } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar.component';
// customerNavItems no longer needed since sidebar displays featured content

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout {
  isSidebar = true;

  onToggleSidebar(){
    this.isSidebar = !this.isSidebar;
  }
}
