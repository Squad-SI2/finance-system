import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { signal } from '@angular/core';
import {
  PlatformLoginRequest,
  PlatformAuthTokenResponse,
  PlatformUserInfo,
} from '../models/platform-auth.models';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformAuthService {
  private apiUrl = '/api/platform/auth';
  private tokenKey = 'platform_access_token';
  private refreshTokenKey = 'platform_refresh_token';

  // Signals para el estado de autenticación de plataforma
  user$ = signal<PlatformUserInfo | null>(null);
  isAuthenticated$ = signal(false);
  isLoading$ = signal(false);
  error$ = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación al cargar la aplicación
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
   * Login exclusivo para Super Admin
   * Consume: POST /api/platform/auth/login
   */
  login(credentials: PlatformLoginRequest): Observable<PlatformAuthTokenResponse> {
    this.isLoading$.set(true);
    this.error$.set(null);

    return this.http
      .post<ApiResponse<PlatformAuthTokenResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => response.data),
        tap((tokenData) => {
          this.saveTokens(tokenData.accessToken, tokenData.refreshToken);
          this.isAuthenticated$.set(true);
          this.isLoading$.set(false);

          // Carga los datos del admin
          this.me().subscribe();
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error en la autenticación de plataforma';
          this.error$.set(errorMessage);
          this.isLoading$.set(false);
          throw error;
        })
      );
  }

  /**
   * Obtiene la información del superadmin autenticado
   * Consume: GET /api/platform/auth/me
   */
  me(): Observable<PlatformUserInfo> {
    return this.http
      .get<ApiResponse<PlatformUserInfo>>(`${this.apiUrl}/me`)
      .pipe(
        map((response) => response.data),
        tap((userInfo) => {
          this.user$.set(userInfo);
        }),
        catchError((error) => {
          this.error$.set('Error al obtener perfil del superadmin');
          throw error;
        })
      );
  }

  /**
   * Refresh del token para plataforma
   * Consume: POST /api/platform/auth/refresh
   */
  refreshToken(): Observable<PlatformAuthTokenResponse> {
    const refreshTokenValue = this.getRefreshToken();

    if (!refreshTokenValue) {
      return of().pipe(
        tap(() => {
          this.logout();
        })
      );
    }

    return this.http
      .post<ApiResponse<PlatformAuthTokenResponse>>(`${this.apiUrl}/refresh`, {
        refreshToken: refreshTokenValue,
      })
      .pipe(
        map((response) => response.data),
        tap((tokenData) => {
          this.saveTokens(tokenData.accessToken, tokenData.refreshToken);
        }),
        catchError(() => {
          this.logout();
          throw new Error('Platform token refresh failed');
        })
      );
  }

  /**
   * Logout de superadmin
   * Consume: POST /api/platform/auth/logout
   */
  logout(): void {
    this.isLoading$.set(true);

    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => {
        this.clearTokens();
      },
      error: () => {
        this.clearTokens();
      },
    });
  }

  /**
   * Limpia el estado y redirige al login administrativo
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.user$.set(null);
    this.isAuthenticated$.set(false);
    this.isLoading$.set(false);
    this.error$.set(null);
    this.router.navigate(['/platform/auth/login']);
  }

  /**
   * Guarda los tokens en localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el token de refresco
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Valida si existe el token
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    return token !== null && token !== undefined && token.trim().length > 0;
  }
}
