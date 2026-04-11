import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TenantSummary = {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  plan: {
    code: string;
    name: string;
    maxUsers: number;
  };
  subscription: {
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    expiresAt: string;
    trialDays?: number;
  };
  usersCount: number;
  rolesCount: number;
  canCreateUsers: boolean;
  canCreateRoles: boolean;
  alerts: string[];
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/dashboard';

  /**
   * Obtiene el resumen del tenant actual
   * El authInterceptor automáticamente agrega:
   * - Authorization: Bearer <token>
   * - X-Tenant-Slug: <slug>
   */
  getTenantSummary(): Observable<TenantSummary> {
    return this.http.get<TenantSummary>(`${this.apiUrl}/tenant/summary`, { responseType: 'json' });
  }
}
