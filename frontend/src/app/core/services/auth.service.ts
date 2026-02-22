// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';
import { User, RegisterData, LoginData, AuthResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Récupérer l'utilisateur depuis le localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null,
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Obtenir l'utilisateur actuel
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtenir le token
  public get token(): string | null {
    return localStorage.getItem('token');
  }

  // Vérifier si l'utilisateur est connecté
  public get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUserValue;
  }

  // Inscription
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          // Stocker le token et l'utilisateur
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      }),
    );
  }

  // Connexion
  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          // Stocker le token et l'utilisateur
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          // Redirection selon le rôle
          const role = response.user.role;
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'boutique') {
            this.router.navigate(['/boutique']); // Adaptez la route selon votre architecture
          } else {
            this.router.navigate(['/home']); // Acheteur par défaut (customer)
          }
        }
      }),
    );
  }

  // Déconnexion
  logout(): void {
    // Supprimer les données du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }

  // Obtenir le profil utilisateur
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  // Mettre à jour le profil
  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap((response) => {
        if (response.success && response.user) {
          // Mettre à jour l'utilisateur dans le localStorage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      }),
    );
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  // Vérifier si l'utilisateur a un des rôles
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUserValue?.role || '');
  }
}
