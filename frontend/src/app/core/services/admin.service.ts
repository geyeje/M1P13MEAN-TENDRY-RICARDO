// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Array<{ _id: string; count: number }>;
    recent: any[];
  };
  shops: {
    total: number;
    active: number;
    pending: number;
    byStatus: Array<{ _id: string; count: number }>;
    topByRevenue: any[];
    recent: any[];
  };
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
    onSale: number;
    avgPrice: number;
    byCategory: Array<{ _id: string; count: number }>;
    topSelling: any[];
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    byStatus: Array<{ _id: string; count: number }>;
    recent: any[];
  };
  revenue: {
    total: number;
    thisMonth: number;
    avgCart: number;
    platformCommission: number;
  };
  charts: {
    ordersByDay: Array<{ _id: string; count: number; revenue: number }>;
    usersByDay: Array<{ _id: string; count: number }>;
  };
  alerts: {
    pendingShops: number;
    pendingOrders: number;
    outOfStock: number;
    inactiveUsers: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardStats;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  getUsers(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  toggleUserActive(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/toggle-active`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  getShops(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/shops`, { params });
  }

  getProducts(params?: any): Observable<any> {
    // On utilise l'API publique des produits mais on peut passer des filtres admin
    return this.http.get(`${environment.apiUrl}/produits`, { params });
  }

  getOrders(params?: any): Observable<any> {
    // L'endpoint /api/commandes (GET) est réservé aux admins et liste tout
    return this.http.get(`${environment.apiUrl}/commandes`, { params });
  }

  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }
}
