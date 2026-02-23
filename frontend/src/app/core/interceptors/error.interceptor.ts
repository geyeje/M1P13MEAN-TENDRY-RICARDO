// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Gérer les erreurs d'authentification (401)
      if (error.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.navigate(['/login']);
      }

      // Gérer les erreurs de serveur (500)
      if (error.status === 500) {
        console.error('Erreur serveur:', error);
      }

      // Gérer l'absence de connexion (0)
      if (error.status === 0) {
        console.error('Impossible de contacter le serveur');
      }

      return throwError(() => error);
    })
  );
};