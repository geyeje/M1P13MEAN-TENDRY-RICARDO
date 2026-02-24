export interface Review{
    id: string;
    userId: string;
    rating: number;
    comment: string;
    productId: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}