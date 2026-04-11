import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type SignupRequest = {
  companyName: string;
  tenantSlug: string;
  adminEmail: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SignupResponse = {
  message: string;
  tenantId: string;
  adminUserId: string;
};

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/public';

  /**
   * Registra una nueva empresa y su administrador
   * Este endpoint es público y no requiere autenticación
   */
  signup(request: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, request, { responseType: 'json' });
  }
}