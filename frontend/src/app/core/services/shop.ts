// src/app/core/services/shop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  productCount: number;
  commandCount: number;
  CA: number;
  note: number;
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

  // Statistiques (admin)
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  // Valider / Suspendre une boutique (admin)
  validateShop(shopId: string, status: string): Observable<ShopResponse> {
    return this.http.put<ShopResponse>(`${this.apiUrl}/${shopId}/validate`, { statut: status });
  }
}
