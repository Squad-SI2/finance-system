import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import {
  LoginRequest,
  AuthTokenResponse,
  UserInfo,
} from '../models/auth.models';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';
  private tokenKey = 'finance_access_token';
  private refreshTokenKey = 'finance_refresh_token';
  private tenantSlugKey = 'finance_tenant_slug';

  // Signals para el estado de autenticación
  user$ = signal<UserInfo | null>(null);
  isAuthenticated$ = signal(false);
  isLoading$ = signal(false);
  error$ = signal<string | null>(null);

  // BehaviorSubject para compatibilidad con subscripciones
  private authStateSubject = new BehaviorSubject<boolean>(this.isTokenValid());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación al cargar la aplicación
   * Valida si hay un token y trae la información del usuario
   */
  private initializeAuth(): void {
    if (this.isTokenValid()) {
      this.isAuthenticated$.set(true);
      this.me().subscribe({
        next: (userInfo) => {
          this.user$.set(userInfo);
        },
        error: () => {
          this.logout();
        },
      });
    }
  }

  /**
   * Login con email y contraseña
   * Consume: POST /api/auth/login
   * Backend retorna: ApiResponse<AuthTokenResponse>
   * Headers: X-Tenant-Slug
   */
  login(credentials: LoginRequest, tenantSlug: string): Observable<AuthTokenResponse> {
    this.isLoading$.set(true);
    this.error$.set(null);

    const headers = new HttpHeaders({
      'X-Tenant-Slug': tenantSlug,
    });

    return this.http
      .post<ApiResponse<AuthTokenResponse>>(`${this.apiUrl}/auth/login`, credentials, {
        headers,
      })
      .pipe(
        map((response) => response.data),
        tap((tokenData) => {
          this.saveTokens(tokenData.accessToken, tokenData.refreshToken);
          this.saveTenantSlug(tenantSlug);
          this.isAuthenticated$.set(true);
          this.isLoading$.set(false);

          // Obtener información del usuario después de login exitoso
          this.me().subscribe();
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error en la autenticación';
          this.error$.set(errorMessage);
          this.isLoading$.set(false);
          throw error;
        })
      );
  }

  /**
   * Obtiene la información del usuario autenticado
   * Consume: GET /api/auth/me
   * Backend retorna: ApiResponse<AuthenticatedTenantUserResponse>
   */
  me(): Observable<UserInfo> {
    const tenantSlug = this.getTenantSlug();
    let headers = new HttpHeaders();

    if (tenantSlug) {
      headers = headers.set('X-Tenant-Slug', tenantSlug);
    }

    return this.http
      .get<ApiResponse<UserInfo>>(`${this.apiUrl}/auth/me`, { headers })
      .pipe(
        map((response) => response.data),
        tap((userInfo) => {
          this.user$.set(userInfo);
        }),
        catchError((error) => {
          this.error$.set('Error al obtener información del usuario');
          throw error;
        })
      );
  }

  /**
   * Refresh del token usando el refresh token
   * Consume: POST /api/auth/refresh
   * Backend retorna: ApiResponse<AuthTokenResponse>
   */
  refreshToken(): Observable<AuthTokenResponse> {
    const refreshTokenValue = this.getRefreshToken();
    const tenantSlug = this.getTenantSlug();

    if (!refreshTokenValue) {
      return of().pipe(
        tap(() => {
          this.logout();
        })
      );
    }

    let headers = new HttpHeaders();
    if (tenantSlug) {
      headers = headers.set('X-Tenant-Slug', tenantSlug);
    }

    return this.http
      .post<ApiResponse<AuthTokenResponse>>(
        `${this.apiUrl}/auth/refresh`,
        { refreshToken: refreshTokenValue },
        { headers }
      )
      .pipe(
        map((response) => response.data),
        tap((tokenData) => {
          this.saveTokens(tokenData.accessToken, tokenData.refreshToken);
        }),
        catchError(() => {
          this.logout();
          throw new Error('Token refresh failed');
        })
      );
  }

  /**
   * Logout del usuario
   * Consume: POST /api/auth/logout
   * Limpia tokens y redirige a login
   */
  logout(): void {
    this.isLoading$.set(true);

    // Llamar al endpoint de logout (sin esperar respuesta crítica)
    const tenantSlug = this.getTenantSlug();
    let headers = new HttpHeaders();

    if (tenantSlug) {
      headers = headers.set('X-Tenant-Slug', tenantSlug);
    }

    this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).subscribe({
      complete: () => {
        this.clearTokens();
      },
      error: () => {
        // Aunque falle el logout en backend, limpiamos el frontend
        this.clearTokens();
      },
    });
  }

  /**
   * Limpia el estado de autenticación
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tenantSlugKey);
    this.user$.set(null);
    this.isAuthenticated$.set(false);
    this.isLoading$.set(false);
    this.error$.set(null);
    this.authStateSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Guarda el token de acceso y refresh en localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.authStateSubject.next(true);
  }

  /**
   * Guarda el tenant slug en localStorage
   */
  private saveTenantSlug(tenantSlug: string): void {
    localStorage.setItem(this.tenantSlugKey, tenantSlug);
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Obtiene el tenant slug
   */
  getTenantSlug(): string | null {
    return localStorage.getItem(this.tenantSlugKey);
  }

  /**
   * Valida si el token es válido (existe)
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    return token !== null && token !== undefined && token.length > 0;
  }

  /**
   * Observable del estado de autenticación (para compatibilidad)
   */
  getAuthState(): Observable<boolean> {
    return this.authStateSubject.asObservable();
  }
}
