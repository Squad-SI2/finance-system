import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type UserRole = 'ADMIN' | 'USER' | 'MANAGER';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserStatusRequest = {
  status: UserStatus;
};

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  /**
   * Obtiene la lista de usuarios del tenant actual
   * El authInterceptor automáticamente agrega:
   * - Authorization: Bearer <token>
   * - X-Tenant-Slug: <slug>
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { responseType: 'json' });
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request, { responseType: 'json' });
  }

  /**
   * Actualiza el estado de un usuario
   */
  updateUserStatus(userId: string, request: UpdateUserStatusRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/status`, request, { responseType: 'json' });
  }
}