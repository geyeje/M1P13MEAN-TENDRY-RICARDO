import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../customer/product_list/product_list.component';
import { ProductService, Product } from '../../core/services/product.service';
import { signal } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ShoppingCartService } from '../../core/services/shopping-cart.service';
import { SeoService } from '../../core/services/seo.service';

interface CategoryGroup {
  name: string;
  products: Product[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private productCartService = inject(ShoppingCartService);
  private seoService = inject(SeoService);

  // tous les produits fetched depuis l'API
  allProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Signal calculé: retourne les produits groupés par catégorie, triés par note
  categorizedProducts = computed(() => {
    const products = this.allProducts();

    // 1. Trier tous les produits par avgRating (du plus haut au plus bas)
    const sortedByRating = [...products].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

    // 2. Grouper par catégorie
    const grouped = new Map<string, Product[]>();
    sortedByRating.forEach((product) => {
      const category = product.category || 'Autres';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(product);
    });

    // 3. Convertir en array et filtrer les catégories vides
    return Array.from(grouped.entries())
      .filter(([_, products]) => products.length > 0)
      .map(
        ([name, products]) =>
          ({
            name,
            products: products.slice(0, 8), // afficher max 8 produits par section
          }) as CategoryGroup,
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // trier les catégories alphabétiquement
  });

  ngOnInit(): void {
    // Charger tous les produits
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.allProducts.set(response.produits || []);
        this.seoService.resetSeo();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(
          'Désolé, impossible de charger les produits. Veuillez réessayer plus tard.',
        );
        this.isLoading.set(false);
      },
    });
  }

  onAddProductToCart(p: Product) {
    this.productCartService.add(p);
  }
}
