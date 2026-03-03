// src/app/features/boutiques/boutique.routes.ts
import { Routes } from '@angular/router';

export const BOUTIQUE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./boutiques-list/boutiques-list.component').then((m) => m.BoutiquesListComponent),
    title: 'Toutes les boutiques',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../customer/store-detail/store-detail.component').then((m) => m.StoreDetail),
    title: 'Détail de la boutique',
  },
];
