// src/app/core/services/shop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Shop {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  phone: string;
  email: string;
  adresse: string;
  schedule?: any;
  statut: 'en_attente' | 'active' | 'suspendue';
  productqt: number;
  commandeqt: number;
  CA: number;
  avgRating: number;
  reviewCount: number;
  socialNetwork?: any;
  userId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ShopResponse {
  success: boolean;
  boutique?: Shop;
  boutiques?: Shop[];
  count?: number;
  total?: number;
  message?: string;
  myRating?: number; // note de l'utilisateur courant si authentifié
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  // Obtenir MA boutique (gérant)
  getMyShop(): Observable<ShopResponse> {
    return this.http.get<ShopResponse>(`${this.apiUrl}/me/myboutique`);
  }

  // Créer une boutique
  createShop(data: FormData): Observable<ShopResponse> {
    return this.http.post<ShopResponse>(this.apiUrl, data);
  }

  // Modifier ma boutique
  updateShop(shopId: string, data: FormData): Observable<ShopResponse> {
    return this.http.put<ShopResponse>(`${this.apiUrl}/${shopId}`, data);
  }

  // Supprimer ma boutique
  deleteShop(shopId: string): Observable<ShopResponse> {
    return this.http.delete<ShopResponse>(`${this.apiUrl}/${shopId}`);
  }

  // Obtenir les détails d'une boutique (public)
  getShopById(shopId: string): Observable<ShopResponse> {
    return this.http.get<ShopResponse>(`${this.apiUrl}/${shopId}`);
  }

  // Liste toutes les boutiques (public)
  getAllShops(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  // Shops vedettes (sidebar)
  getFeaturedShops(limit = 5): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/featured`, { params });
  }

  // Statistiques (admin)
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  // Catégories disponibles
  getCategories(): string[] {
    return [
      'Mode & Vêtements',
      'Électronique & High-tech',
      'Alimentation & Boissons',
      'Beauté & Cosmétiques',
      'Sport & Loisirs',
      'Maison & Décoration',
      'Livres & Culture',
      'Jouets & Enfants',
      'Santé & Bien-être',
      'Bijouterie & Accessoires',
      'Services',
      'Autres',
    ];
  }

  // Soumettre une évaluation pour une boutique
  submitRating(shopId: string, rating: number, comment?: string): Observable<any> {
    const payload = {
      rating,
      ...(comment && { comment }),
    };
    return this.http.post(`${this.apiUrl}/${shopId}/rate`, payload);
  }
}