import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { PlatformAuthService } from '../../features/auth/data-access/platform-auth.service';
import { SessionService } from '../session/services/session.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * HttpInterceptor funcional inteligente:
 * Verifica si la URL es de plataforma (/api/platform) o de tenant (/api/...)
 * Inyecta el token y headers correspondientes, y maneja el refresh 401.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const isPlatformRequest = req.url.startsWith('/api/platform');
  
  const sessionService = inject(SessionService);
  const platformAuthService = inject(PlatformAuthService);
  const tenantAuthService = inject(AuthService);

  let token: string | null = null;

  if (isPlatformRequest) {
    // Lógica para Super Admin (Plataforma)
    token = platformAuthService.getAccessToken();
    if (token) {
      req = addTokenToRequest(req, token);
    }
  } else {
    // Lógica para Usuarios de Tenant
    token = tenantAuthService.getAccessToken();
    const tenantSlug = sessionService.getTenant();
    
    if (token) {
      req = addTokenToRequest(req, token);
    }

    if (tenantSlug && !req.headers.has('X-Tenant-Slug')) {
      req = req.clone({
        setHeaders: {
          'X-Tenant-Slug': tenantSlug,
        },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar el error 401 (Unauthorized) usando el servicio correcto
      if (error.status === 401) {
        const activeService = isPlatformRequest ? platformAuthService : tenantAuthService;
        return handle401Error(req, next, activeService, token);
      }

      // Propagar otros errores
      return throwError(() => error);
    })
  );
};

/**
 * Agrega el token Bearer al header Authorization
 */
function addTokenToRequest(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Maneja errores 401 unificadamente, utilizando el AuthService genérico inyectado
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: any, // Puede ser AuthService o PlatformAuthService, ambos tienen refreshToken() y logout()
  token: string | null
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((newToken) => newToken !== null),
      take(1),
      switchMap((newToken) => {
        if (newToken) {
          const clonedReq = addTokenToRequest(req, newToken);
          return next(clonedReq);
        }
        return throwError(() => new Error('No token available'));
      }),
      catchError(() => {
        authService.logout();
        return throwError(() => new Error('Authentication failed'));
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      const newToken = response.accessToken;
      refreshTokenSubject.next(newToken);

      const clonedReq = addTokenToRequest(req, newToken);
      return next(clonedReq);
    }),
    catchError((error: any) => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('Token refresh failed'));
    })
  );
}
