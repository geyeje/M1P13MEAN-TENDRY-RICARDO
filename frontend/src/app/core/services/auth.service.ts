// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  // use "boutique" to mirror backend concept of store owner
  role: 'admin' | 'boutique' | 'acheteur';
  telephone?: string;
  adresse?: string;
  avatar?: string | null;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'boutique' | 'acheteur';
  telephone: string;
  adresse?: string;
  acceptTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  register(data: RegisterData | FormData): Observable<AuthResponse> {
    // Accepts either a plain object or FormData (when avatar included)
    if (data instanceof FormData) {
      // assume front-end already appended all necessary fields, including firstname/lastname etc
      return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
        tap((response: any) => {
          if (response.success) {
            this.handleAuth(response);
          }
        }),
      );
    }

    // Ne pas envoyer confirmPassword au backend
    const { confirmPassword, acceptTerms, nom, prenom, role, telephone, adresse, ...rest } = data;

    let backendRole = 'customer';
    if (role === 'admin') backendRole = 'admin';
    else if (role === 'boutique') backendRole = 'store'; // backend still uses "store" for shop owners

    const registerPayload = {
      ...rest,
      firstname: prenom,
      lastname: nom,
      role: backendRole,
      phone: telephone,
      address: adresse || '',
    };

    return this.http.post<any>(`${this.apiUrl}/register`, registerPayload).pipe(
      tap((response: any) => {
        if (response.success) {
          this.handleAuth(response);
        }
      }),
    );
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response.success) {
          this.handleAuth(response);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    // support backward compatibility if some code still passes 'store'
    if (role === 'store') role = 'boutique';
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    // admins can access everything
    if (user.role === 'admin') {
      return true;
    }
    // map 'store' to 'boutique' as necessary
    const normalizedRoles = roles.map((r) => (r === 'store' ? 'boutique' : r));
    return normalizedRoles.includes(user.role);
  }

  private handleAuth(response: any): void {
    const backendUser = response.user;

    // Convertir les rôles du backend vers le frontend
    let frontendRole = 'acheteur';
    if (backendUser.role === 'admin') frontendRole = 'admin';
    else if (backendUser.role === 'store' /* ancienne valeur côté serveur */)
      frontendRole = 'boutique';

    const frontendUser: User = {
      id: backendUser.id || backendUser._id,
      nom: backendUser.lastname || backendUser.nom || '',
      prenom: backendUser.firstname || backendUser.prenom || '',
      email: backendUser.email,
      role: frontendRole as any,
      telephone: backendUser.phone || backendUser.telephone || '',
      adresse: backendUser.address || backendUser.adresse || '',
    };

    const newResponse = { ...response, user: frontendUser };

    localStorage.setItem('token', newResponse.token);
    localStorage.setItem('currentUser', JSON.stringify(newResponse.user));
    this.currentUserSubject.next(newResponse.user);

    // Redirection selon le rôle
    this.redirectAfterAuth(newResponse.user.role);
  }

  private redirectAfterAuth(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'boutique':
        this.router.navigate(['/shop-owner/dashboard']);
        break;
      case 'acheteur':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Erreur parsing user:', error);
        this.logout();
      }
    }
  }
}
