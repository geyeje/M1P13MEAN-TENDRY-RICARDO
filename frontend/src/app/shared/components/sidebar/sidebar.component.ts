import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ShopService } from '../../../core/services/shop';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class Sidebar {
  authService = inject(AuthService);
  shopService = inject(ShopService); // Injection du service d'authentification
  currentUser = toSignal(this.authService.currentUser$); // Conversion de l'observable currentUser en signal
  name = computed(() => this.currentUser()?.prenom || 'invité');
  navItems = input<{name: string, route: string, icon?: string}[]>([]); // Signal calculé pour obtenir le nom de l'utilisateur
}
