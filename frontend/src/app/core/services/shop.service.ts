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
  address: string;
  adresse?: string;
  schedule?: any;
  status: 'en_attente' | 'active' | 'suspendue';
  statut?: string; // transition alias
  productCount: number;
  productqt?: number; // transition alias
  commandCount: number;
  commandeqt?: number; // transition alias
  CA: number;
  featured?: boolean;
  note: number;
  avgRating?: number; // transition alias
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
  currentPage?: number;
  totalPages?: number;
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

  getBoutiqueById(id: string): Observable<ShopResponse> {
    return this.getShopById(id);
  }

  // Liste toutes les boutiques (public)
  getAllShops(params?: any): Observable<ShopResponse> {
    return this.http.get<ShopResponse>(this.apiUrl, { params });
  }

  getAllBoutiques(params?: any): Observable<ShopResponse> {
    return this.getAllShops(params);
  }

  // Shops vedettes (sidebar)
  getFeaturedShops(limit = 5): Observable<ShopResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ShopResponse>(`${this.apiUrl}/featured`, { params });
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
  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/no-image.png';
    if (path.startsWith('http')) return path;
    // Ajustez selon votre configuration serveur
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
