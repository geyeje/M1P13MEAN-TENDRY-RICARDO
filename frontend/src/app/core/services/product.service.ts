import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { delay, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private productSignal = signal<Product[]>([]);
  readonly products = this.productSignal.asReadonly();
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    
  }

  private mockProducts: Product[] = [
  {
    "id": "65cf12345678901234567890",
    "name": "Kit de Culture Matcha",
    "description": "Tout le nécessaire pour faire pousser votre propre Camellia Sinensis à domicile. Terreau bio inclus.",
    "price": 45.00,
    "promotionPrice": 39.90,
    "mainImage": "https://images.unsplash.com/photo-1582793988951-9aed55099991?q=80&w=500",
    "stock": 12,
    "storeId": "65cf12345678901234567891",
    "category": "Botanique",
    "brand": "Green Finger",
    "specialOffert": true,
    "reductionPercentage": 11,
    "review": 4.8,
    "featured": true
  },
  {
    "id": "65cf12345678901234567891",
    "name": "Lampe Solaire 'Leaf'",
    "description": "Une lampe d'appoint design qui se recharge le jour pour éclairer vos soirées lecture.",
    "price": 29.00,
    "mainImage": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500",
    "stock": 45,
    "storeId": "65cf12345678901234567892",
    "category": "Énergie Verte",
    "brand": "EcoLight",
    "review": 4.5,
    "novelty": true
  },
  {
    "id": "65cf12345678901234567892",
    "name": "Panier Bio 'Semaine'",
    "description": "5kg de fruits et légumes de saison, récoltés le matin même par nos producteurs locaux.",
    "price": 25.00,
    "mainImage": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500",
    "stock": 8,
    "storeId": "65cf12345678901234567893",
    "category": "Fruits & Légumes",
    "characteristics": { "Origine": "France", "Label": "AB" },
    "review": 4.9,
    "reviewNumber": 120
  },
  {
    "id": "65cf12345678901234567893",
    "name": "Engrais Liquide Bio",
    "description": "Nutriments 100% naturels pour booster la croissance de vos plantes d'intérieur.",
    "price": 12.50,
    "mainImage": "https://images.unsplash.com/photo-1416870230247-d0e99dfa0121?q=80&w=500",
    "stock": 100,
    "storeId": "65cf12345678901234567891",
    "category": "Botanique",
    "brand": "Botanica"
  },
  {
    "id": "65cf12345678901234567894",
    "name": "Batterie Nomade Solaire",
    "description": "Chargez votre téléphone partout grâce au soleil. Ultra résistante et waterproof.",
    "price": 59.00,
    "mainImage": "https://images.unsplash.com/photo-1617788130035-e439f3160139?q=80&w=500",
    "stock": 15,
    "storeId": "65cf12345678901234567892",
    "category": "Énergie Verte",
    "brand": "EcoLight",
    "featured": true
  }
]

  /*public getProducts(): Product[]{
    if(this.products.length === 0){
      this.isLoading.set(true);
      this.http.get<Product[]>(this.apiUrl).subscribe({
        next: (response) =>{
          this.products = response;
          this.isLoading.set(false);
        },
        error: (error) =>{
          if(error.status === 401){
            this.router.navigate(['/login']);
          }else if(error.status === 403){
            this.error.set(`Erreur d'autorisation: ${error.message}`);
          }
          else if(error.status === 404){
            this.error.set(`Ressource non trouvée: ${error.message}`);
          }
          else if(error.status === 500){
            this.error.set(`Erreur serveur: ${error.message}`);
          }
        }
      })
    }
    return this.products;
  }*/

  public getProducts():Observable<Product[]>{
    return of(this.mockProducts).pipe(
      delay(800),
      map((prods: Product[]) =>{
        this.productSignal.set(prods);
        return prods;
      })
    )
  }

  public getProductByStore(storeId: string): Observable<Product[]>{
    return of(this.mockProducts.filter(p => p.storeId === storeId)).pipe(delay(800));
  }

  public getFeaturedProducts(): Observable<Product[]>{
    return of(this.mockProducts.filter(p => p.featured)).pipe(delay(800));
  }
}
