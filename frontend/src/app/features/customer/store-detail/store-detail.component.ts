import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/Shop.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImageErrorDirective } from '../../../shared/directives/image-error.directive';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, ImageErrorDirective],
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss',
})
export class StoreDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);

  boutique = signal<Shop | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shopService.getShopById(id).subscribe({
        next: (res) => {
          if (res && res.boutique) {
            this.boutique.set(res.boutique);
          } else {
            this.error.set('Boutique introuvable');
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors du chargement de la boutique');
          this.loading.set(false);
        },
      });
    } else {
      this.error.set('Identifiant manquant');
      this.loading.set(false);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
