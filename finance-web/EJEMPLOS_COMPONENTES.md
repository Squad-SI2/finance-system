# 📖 EJEMPLOS DE USO - AuthService en Componentes

Este documento muestra cómo usar el AuthService en otros componentes de la aplicación.

## 1. Usar AuthService en DashboardPage

```typescript
// src/app/features/dashboard/pages/dashboard-page/dashboard-page.ts
import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@features/auth/data-access/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Bienvenido, {{ user()?.firstName }}!</h1>

      <div class="mt-4 grid gap-4">
        <div class="rounded-lg bg-blue-50 p-4">
          <p class="text-sm text-slate-600">Email</p>
          <p class="font-medium">{{ user()?.email }}</p>
        </div>

        <div class="rounded-lg bg-blue-50 p-4">
          <p class="text-sm text-slate-600">Tenant</p>
          <p class="font-medium">{{ tenantSlug() }}</p>
        </div>

        <div class="rounded-lg bg-blue-50 p-4">
          <p class="text-sm text-slate-600">Roles</p>
          <p class="font-medium">{{ user()?.roles?.join(', ') }}</p>
        </div>
      </div>

      <button
        (click)="handleLogout()"
        class="mt-6 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  `,
})
export class DashboardPage {
  private authService = inject(AuthService);

  // Acceder a los signals del AuthService
  user = this.authService.user$;
  tenantSlug = this.authService.getTenantSlug;

  constructor() {
    // Usar effect para reaccionar a cambios de usuario
    effect(() => {
      if (this.user()) {
        console.log('Usuario cargado:', this.user());
      }
    });
  }

  handleLogout(): void {
    this.authService.logout();
    // Router automáticamente redirige a /login
  }
}
```

---

## 2. Usar AuthService en Header/Navbar

```typescript
// src/app/core/layout/components/app-header/app-header.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@features/auth/data-access/auth.service';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="border-b border-slate-200 bg-white">
      <div class="flex items-center justify-between px-6 py-4">
        <h1 class="text-xl font-bold">Finance System</h1>

        <div class="flex items-center gap-4">
          @if (user()) {
            <span class="text-sm text-slate-600">
              {{ user()?.firstName }} {{ user()?.lastName }}
            </span>
            <button
              (click)="handleLogout()"
              class="rounded-lg bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
            >
              Logout
            </button>
          }
        </div>
      </div>
    </header>
  `,
})
export class AppHeader {
  authService = inject(AuthService);

  user = this.authService.user$;

  handleLogout(): void {
    this.authService.logout();
  }
}
```

---

## 3. Crear un Servicio que Consume API Protegida

```typescript
// src/app/features/dashboard/data-access/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@features/auth/data-access/auth.service';

export interface TenantSummary {
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
    status: string;
    expiresAt: string;
  };
  usersCount: number;
  rolesCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = '/api/dashboard';

  /**
   * Obtiene resumen del tenant actual
   * El interceptor automáticamente agrega:
   * - Authorization: Bearer <token>
   * - X-Tenant-Slug: <slug>
   */
  getTenantSummary(): Observable<TenantSummary> {
    return this.http.get<TenantSummary>(`${this.apiUrl}/tenant/summary`);
  }
}
```

---

## 4. Usar DashboardService en Componente

```typescript
// src/app/features/dashboard/pages/dashboard-page/dashboard-page.ts
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  TenantSummary,
} from '../../data-access/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      @if (isLoading()) {
        <p class="text-slate-500">Cargando...</p>
      } @else if (error()) {
        <div class="rounded-lg bg-red-50 p-4 text-red-700">
          {{ error() }}
        </div>
      } @else if (summary()) {
        <div class="space-y-4">
          <h1 class="text-2xl font-bold">
            {{ summary()?.tenant.name }}
          </h1>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="rounded-lg bg-blue-50 p-4">
              <p class="text-sm text-slate-600">Plan</p>
              <p class="font-medium">{{ summary()?.plan.name }}</p>
            </div>

            <div class="rounded-lg bg-green-50 p-4">
              <p class="text-sm text-slate-600">Usuarios</p>
              <p class="font-medium">
                {{ summary()?.usersCount }} /
                {{ summary()?.plan.maxUsers }}
              </p>
            </div>

            <div class="rounded-lg bg-purple-50 p-4">
              <p class="text-sm text-slate-600">Estado</p>
              <p [class]="getStatusClass()">
                {{ summary()?.subscription.status }}
              </p>
            </div>

            <div class="rounded-lg bg-yellow-50 p-4">
              <p class="text-sm text-slate-600">Expira</p>
              <p class="font-medium">{{ summary()?.subscription.expiresAt }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage {
  dashboardService = inject(DashboardService);

  summary = signal<TenantSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getTenantSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error cargando el resumen');
        this.isLoading.set(false);
      },
    });
  }

  private getStatusClass(): string {
    const status = this.summary()?.subscription.status;
    const baseClass = 'font-medium';

    switch (status) {
      case 'ACTIVE':
        return `${baseClass} text-green-700`;
      case 'TRIAL':
        return `${baseClass} text-blue-700`;
      case 'EXPIRED':
        return `${baseClass} text-red-700`;
      default:
        return baseClass;
    }
  }
}
```

---

## 5. Crear Servicio para Gestión de Usuarios

```typescript
// src/app/features/users/data-access/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  /**
   * Lista todos los usuarios del tenant
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  /**
   * Actualiza un usuario
   */
  updateUser(id: string, request: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Activa un usuario
   */
  activateUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Desactiva un usuario
   */
  deactivateUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
```

---

## 6. Usar UsersService en Lista de Usuarios

```typescript
// src/app/features/users/pages/users-list/users-list.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../../data-access/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Usuarios</h2>
        <button
          (click)="handleCreateUser()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Agregar Usuario
        </button>
      </div>

      @if (isLoading()) {
        <p class="text-slate-500">Cargando usuarios...</p>
      } @else if (users().length === 0) {
        <p class="text-slate-500">No hay usuarios</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b bg-slate-50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium">Nombre</th>
                <th class="px-4 py-2 text-left text-sm font-medium">Email</th>
                <th class="px-4 py-2 text-left text-sm font-medium">Estado</th>
                <th class="px-4 py-2 text-left text-sm font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr class="border-b hover:bg-slate-50">
                  <td class="px-4 py-2">
                    {{ user.firstName }} {{ user.lastName }}
                  </td>
                  <td class="px-4 py-2 text-sm">{{ user.email }}</td>
                  <td class="px-4 py-2">
                    <span
                      [class]="user.active ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ user.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="space-x-2 px-4 py-2">
                    <button
                      (click)="handleEdit(user)"
                      class="text-sm text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    @if (user.active) {
                      <button
                        (click)="handleDeactivate(user.id)"
                        class="text-sm text-red-600 hover:underline"
                      >
                        Desactivar
                      </button>
                    } @else {
                      <button
                        (click)="handleActivate(user.id)"
                        class="text-sm text-green-600 hover:underline"
                      >
                        Activar
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class UsersListPage {
  usersService = inject(UsersService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error cargando usuarios');
        this.isLoading.set(false);
      },
    });
  }

  handleCreateUser(): void {
    // Abre un modal o navega a /users/create
    console.log('Crear usuario');
  }

  handleEdit(user: User): void {
    // Abre un modal o navega a /users/:id/edit
    console.log('Editar usuario:', user.id);
  }

  handleActivate(id: string): void {
    this.usersService.activateUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }

  handleDeactivate(id: string): void {
    this.usersService.deactivateUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }
}
```

---

## 7. Crear un Servicio para Roles

```typescript
// src/app/features/roles/data-access/roles.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {
  code: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  permissionCodes: string[];
  createdAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionCodes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/access';

  /**
   * Lista todos los permisos disponibles
   */
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
  }

  /**
   * Lista todos los roles del tenant
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  /**
   * Obtiene un rol por ID
   */
  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  /**
   * Crea un nuevo rol
   */
  createRole(request: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, request);
  }

  /**
   * Actualiza un rol
   */
  updateRole(id: string, request: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, request);
  }

  /**
   * Asigna roles a un usuario
   */
  assignRolesToUser(userId: string, roleIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/roles`, {
      roleIds,
    });
  }

  /**
   * Obtiene los roles de un usuario
   */
  getUserRoles(userId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/users/${userId}/roles`);
  }
}
```

---

## 8. Patrón Recomendado para Componentes

```typescript
// Patrón general para cualquier componente que consume API

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SomeService, SomeModel } from './data-access/some.service';

@Component({
  selector: 'app-some-feature',
  standalone: true,
  imports: [CommonModule],
})
export class SomeFeature {
  // 1. Inyectar servicios
  private service = inject(SomeService);

  // 2. Signals para datos y estado
  data = signal<SomeModel | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // 3. Cargar datos al inicializar
    this.loadData();
  }

  // 4. Método de carga
  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getData().subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error cargando datos');
        this.isLoading.set(false);
      },
    });
  }

  // 5. Métodos de acción
  handle...Action(): void {
    this.service.someAction(...).subscribe({
      next: () => {
        this.loadData(); // Recargar si es necesario
      },
      error: (err) => {
        this.error.set('Error en la acción');
      },
    });
  }
}
```

---

## Summary

Este documento muestra cómo:

1. ✅ Usar AuthService para usuario actual y logout
2. ✅ Consumir APIs protegidas en servicios
3. ✅ Usar Signals para estado reactivo
4. ✅ Mostrar loading, error, y datos
5. ✅ Patrones reutilizables para otros servicios
6. ✅ El interceptor automáticamente agrega headers en toda request

**Clave**: El `authInterceptor` asegura que todos los servicios tengan los headers automáticamente, así que solo necesitas enfocarte en consumir la API específica.
