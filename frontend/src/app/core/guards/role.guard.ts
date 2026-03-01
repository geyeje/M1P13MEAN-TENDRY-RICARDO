// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let requiredRole = route.data['role'];
  const user = authService.currentUserValue;

  // normalize legacy 'store' to 'boutique'
  if (requiredRole === 'store') requiredRole = 'boutique';

  if (user && user.role === requiredRole) {
    return true;
  }

  // Rediriger selon le rôle
  switch (user?.role) {
    case 'admin':
      router.navigate(['/admin/dashboard']);
      break;
    case 'boutique':
      router.navigate(['/shop-owner/dashboard']);
      break;
    case 'acheteur':
      router.navigate(['/']);
      break;
    default:
      router.navigate(['/login']);
  }

  return false;
};