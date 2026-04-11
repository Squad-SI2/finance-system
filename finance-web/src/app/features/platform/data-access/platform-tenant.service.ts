import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PlatformTenantResponse,
  CreateTenantRequest,
} from '../models/platform-tenant.models';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformTenantService {
  private apiUrl = '/api/platform/tenants';

  constructor(private http: HttpClient) {}

  /**Obtiene la lista de todos los tenants registrados.*/
  getTenants(): Observable<PlatformTenantResponse[]> {
    return this.http
      .get<ApiResponse<PlatformTenantResponse[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  /**Obtiene un tenant por su ID.*/
  getTenantById(id: string): Observable<PlatformTenantResponse> {
    return this.http
      .get<ApiResponse<PlatformTenantResponse>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**Crea un nuevo tenant.*/
  createTenant(request: CreateTenantRequest): Observable<PlatformTenantResponse> {
    return this.http
      .post<ApiResponse<PlatformTenantResponse>>(this.apiUrl, request)
      .pipe(map((response) => response.data));
  }

  /**Activa un tenant permitiendo el acceso a sus usuarios.*/
  activateTenant(id: string): Observable<PlatformTenantResponse> {
    return this.http
      .patch<ApiResponse<PlatformTenantResponse>>(`${this.apiUrl}/${id}/activate`, {})
      .pipe(map((response) => response.data));
  }

  /**Desactiva un tenant bloqueando el acceso a todo su esquema.*/
  deactivateTenant(id: string): Observable<PlatformTenantResponse> {
    return this.http
      .patch<ApiResponse<PlatformTenantResponse>>(`${this.apiUrl}/${id}/deactivate`, {})
      .pipe(map((response) => response.data));
  }
}
