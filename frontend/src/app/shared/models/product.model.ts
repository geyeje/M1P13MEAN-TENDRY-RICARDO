export interface Product {
    id: string;
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
    review?: number;
    featured?: boolean;
    novelty?: boolean;
    characteristics?: { [key: string]: string };
    reviewNumber?: number;
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