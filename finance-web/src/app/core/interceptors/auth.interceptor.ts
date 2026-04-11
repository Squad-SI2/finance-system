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

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * HttpInterceptor funcional que:
 * 1. Agrega el token JWT a todas las peticiones
 * 2. Maneja errores 401 (Unauthorized) refrescando el token
 * 3. Si el refresh falla, hace logout automáticamente
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Obtener el token actual
  const token = authService.getAccessToken();
  const tenantSlug = authService.getTenantSlug();

  // Agregar el token al header Authorization
  if (token) {
    req = addTokenToRequest(req, token);
  }

  // Agregar el tenant slug si existe
  if (tenantSlug && !req.headers.has('X-Tenant-Slug')) {
    req = req.clone({
      setHeaders: {
        'X-Tenant-Slug': tenantSlug,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error 401 (Unauthorized), intentar refrescar el token
      if (error.status === 401) {
        return handle401Error(req, next, authService, token);
      }

      // Para otros errores, simplemente propagar
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
 * Maneja errores 401:
 * - Si ya está refrescando, espera a que termine
 * - Si no está refrescando, intenta refrescar el token
 * - Si el refresh falla, hace logout
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  token: string | null
): Observable<HttpEvent<unknown>> {
  // Si ya estábamos refrescando, esperar a que termine
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

  // Marcar que estamos refrescando
  isRefreshing = true;
  refreshTokenSubject.next(null);

  // Intentar refrescar el token
  return authService.refreshToken().pipe(
    switchMap((response) => {
      isRefreshing = false;
      const newToken = response.accessToken;
      refreshTokenSubject.next(newToken);

      // Reintentar la petición original con el nuevo token
      const clonedReq = addTokenToRequest(req, newToken);
      return next(clonedReq);
    }),
    catchError((error) => {
      isRefreshing = false;
      // Si el refresh falla, hacer logout automáticamente
      authService.logout();
      return throwError(() => new Error('Token refresh failed'));
    })
  );
}
