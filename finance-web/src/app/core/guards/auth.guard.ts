import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../../features/auth/data-access/auth.service';

/**
 * Guard funcional que protege las rutas privadas
 * Verifica si existe un token JWT válido
 * Si no existe, redirige a /login
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario tiene un token válido
  if (authService.isTokenValid()) {
    return true;
  }

  // Si no hay token, redirigir a login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
