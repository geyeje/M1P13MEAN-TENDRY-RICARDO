import { Review } from "./review.model";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionPrice?: number;
    onSale: boolean;
    category: ProductCategory;
    stock: number;
    brand?: string;
    colors?: string[];
    sizes?: string[];
    specs?: { [key: string]: string };
    tags?: string[];
    images: string[];
    shopId: string;
    avgRating?: number;
    reviewCount?: number;
    salesCount?: number;
    viewCount?: number;
    reviews?: Review[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductCreationDTO{
    name: string;
    description: string;
    price: number;
    promotionPrice?: number;
    mainImage: string;
    stock: number;
    storeId: string;
    category: string;
    brand?: string;
    specialOffert?: boolean;
    reductionPercentage?: number;
    featured?: boolean;
    novelty?: boolean;
    characteristics?: { [key: string]: string };
}

export interface ProductResponse {
    success: boolean;
    message: string;
    product?: Product;
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    products: Product[];
}

export enum ProductCategory {
    fashion ='Mode & Vêtements',
    electronics = 'Électronique & High-tech',
    food = 'Alimentation & Boissons',
    beauty = 'Beauté & Cosmétiques',
    sports = 'Sport & Loisirs',
    home = 'Maison & Décoration',
    books = 'Livres & Culture',
    toys = 'Jouets & Enfants',
    health = 'Santé & Bien-être',
    jewelry = 'Bijouterie & Accessoires',
    others = 'Autres'
}