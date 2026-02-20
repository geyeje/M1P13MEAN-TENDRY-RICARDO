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