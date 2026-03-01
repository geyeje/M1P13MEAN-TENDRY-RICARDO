import { Component } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout {
  menuItems: MenuItem[] = [
    { icon: '', label: 'Accueil', route: '/customer/dashboard' },
    { icon: '', label: 'nos produits', route: '/customer/product-list' },
    { icon: '', label: 'commandes', route: '/customer/order' },
    { icon: '', label: 'profil', route: '/customer/profil', badge: 0 },
    { icon: '', label: 'Paramètres', route: '/customer/settings' },
  ];
}
