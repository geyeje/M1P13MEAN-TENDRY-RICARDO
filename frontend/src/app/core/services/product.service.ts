// src/app/core/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  onSale: boolean;
  category: string;
  stock: number;
  brand?: string;
  colors: string[];
  sizes: string[];
  specs?: any;
  tags: string[];
  images: string[];
  shopId: any;
  boutiqueId?: string;
  avgRating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  reviews?: any[];
  createdAt: string;
  updatedAt: string;
}

/*export interface ProductFormArgs{
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  onSale: boolean;
  category: string;
  stock: number;
  brand?: string;
  colors: string[];
  sizes: string[];
  specs?: any;
  tags: string[];
  images: string[];
}*/

export interface ProductResponse {
  success: boolean;
  produit?: Product;
  produits?: Product[];
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  message?: string;
  myRating?: number; // note de l'utilisateur courant
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  // Mes produits (gérant)
  getMyProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/me/myproduits`);
  }

  // Liste tous les produits (public)
  getAllProducts(filters?: any): Observable<ProductResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  // Produits vedettes
  getFeaturedProducts(limit = 5): Observable<ProductResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ProductResponse>(`${this.apiUrl}/featured`, { params });
  }

  // Détails d'un produit
  getProductById(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${productId}`);
  }

  // Créer un produit
  createProduct(data: FormData): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, data);
  }

  // Modifier un produit
  updateProduct(productId: string, data: FormData): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${productId}`, data);
  }

  // Supprimer un produit
  deleteProduct(productId: string): Observable<ProductResponse> {
    return this.http.delete<ProductResponse>(`${this.apiUrl}/${productId}`);
  }

  // Mettre à jour le stock
  updateStock(
    productId: string,
    data: { quantity: number; operation?: 'add' | 'subtract' },
  ): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.apiUrl}/${productId}/stock`, data);
  }

  // Ajouter un avis (acheteur)
  addReview(
    productId: string,
    review: { rating: number; comment?: string },
  ): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/${productId}/reviews`, review);
  }

  // Soumettre une évaluation pour un produit
  submitRating(productId: string, rating: number, comment?: string): Observable<any> {
    const payload = {
      rating,
      ...(comment && { comment }),
    };
    return this.http.post(`${this.apiUrl}/${productId}/rate`, payload);
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
      'Autres',
    ];
  }
}
