import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur JWT (Fonction)
 * Intercepte toutes les requêtes HTTP sortantes pour y attacher le token d'authentification.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. On injecte le service d'authentification
  const authService = inject(AuthService);

  // 2. On récupère le token JWT s'il existe
  const token = authService.token;

  // 3. Si on a un token, on clone la requête pour y ajouter le header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 4. On passe la requête modifiée au gestionnaire HTTP suivant (ou au backend)
  return next(req);
};
