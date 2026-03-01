import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ShoppingCartService } from '../../../core/services/shopping-cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { AsyncPipe } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class Navbar {
  authService = inject(AuthService);// Injection du service d'authentification
  cart = inject(ShoppingCartService);
  cartCount = computed(() => this.cart.items().reduce((sum, i) => sum + i.quantity, 0));

  title: string = ('Matcha').toLocaleUpperCase();
  Logo: any = 'M';
}
