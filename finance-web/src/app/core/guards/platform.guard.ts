import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlatformAuthService } from '../../features/auth/data-access/platform-auth.service';

/**
 * Guard que asegura que solo un Super Admin con sesión activa en Plataforma
 * pueda acceder a la ruta protegida. Si falla, redirige al login administrativo.
 */
export const platformGuard: CanActivateFn = () => {
  const authService = inject(PlatformAuthService);
  const router = inject(Router);

  if (authService.isTokenValid()) {
    return true;
  }

  return router.parseUrl('/platform/auth/login');
};
