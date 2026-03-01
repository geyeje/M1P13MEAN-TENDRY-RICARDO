import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ShopService } from '../../../../core/services/shop';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  user$: Observable<User | null>;
  shopName = '';
  shopStatus = '';

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router,
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadShopInfo();
  }

  loadShopInfo() {
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          this.shopName = response.boutique.name;
          this.shopStatus = response.boutique.status;
        }
      },
      error: (error) => {
        console.error('Erreur chargement boutique:', error);
      },
    });
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      en_attente: 'En attente de validation',
      active: 'Active',
      suspendue: 'Suspendue',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      en_attente: 'status-warning',
      active: 'status-success',
      suspendue: 'status-danger',
    };
    return classes[status] || 'status-default';
  }
}
