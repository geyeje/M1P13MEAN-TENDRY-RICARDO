// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

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
}