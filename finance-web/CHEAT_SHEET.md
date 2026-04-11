# ⚡ CHEAT SHEET - Referencia Rápida

## 🚀 Start Project

```bash
# Backend
cd finance-api && ./mvnw spring-boot:run
# http://localhost:8080

# Frontend
cd finance-web && npm start
# http://localhost:4200
```

---

## 🔐 AuthService - Debe Memorizar Esto

```typescript
import { AuthService } from '@app/features/auth/data-access/auth.service';

authService = inject(AuthService);

// Login
authService.login({ email, password }, tenantSlug).subscribe(...);

// Logout (limpia todo)
authService.logout();

// Actualizar token
authService.refreshToken().subscribe(...);

// Obtener info del usuario
authService.me().subscribe(...);

// Acceder a signals
authService.user$()           // UserInfo | null
authService.isAuthenticated$() // boolean
authService.isLoading$()      // boolean
authService.error$()          // string | null

// Obtener valores
authService.getAccessToken()  // "eyJhbGc..."
authService.getTenantSlug()   // "miempresa"
authService.isTokenValid()    // true/false
```

---

## 📡 HttpInterceptor - Automático

```typescript
// NO NECESITAS HACER NADA
// Automáticamente agrega en TODA petición:

Authorization: Bearer <token>
X-Tenant-Slug: <slug>

// Si 401 → intenta refresh
// Si refresh falla → logout
```

---

## 🛡️ AuthGuard - Proteger Rutas

```typescript
// En rutas
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadChildren: () => ...
}

// Listo. Sin token → redirect a /login
```

---

## 📂 Crear Nueva Feature (Ej: Users)

### 1. Crear estructura

```bash
mkdir -p src/app/features/users/{data-access,models,pages/{users-list,user-detail}}
```

### 2. Crear modelo

```typescript
// users/models/user.models.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

### 3. Crear servicio

```typescript
// users/data-access/users.service.ts
@Injectable({ providedIn: 'root' })
export class UsersService {
  http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // headers automáticos via authInterceptor ✅
  }

  createUser(req: CreateUserRequest): Observable<User> {
    return this.http.post<User>('/api/users', req);
  }

  updateUser(id: string, req: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, req);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
```

### 4. Crear componente

```typescript
// users/pages/users-list/users-list.ts
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading()) {
      <p>Cargando...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      @for (user of users(); track user.id) {
        <div>{{ user.firstName }} - {{ user.email }}</div>
      }
    }
  `,
})
export class UsersListPage {
  service = inject(UsersService);
  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.service.getUsers().subscribe({
      next: (u) => {
        this.users.set(u);
        this.isLoading.set(false);
      },
      error: (e) => {
        this.error.set('Error');
        this.isLoading.set(false);
      },
    });
  }
}
```

### 5. Crear rutas

```typescript
// users/users.routes.ts
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-list/users-list').then((m) => m.UsersListPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-detail/user-detail').then((m) => m.UserDetailPage),
  },
];
```

### 6. Agregar a dashboard

```typescript
// dashboard/dashboard.routes.ts
{
  path: 'users',
  loadChildren: () =>
    import('../users/users.routes').then(m => m.USERS_ROUTES)
}
```

**Listo.** La feature está conectada.

---

## 📡 Endpoints Fundamentales

```
POST   /api/auth/login              Email + Password → Token
GET    /api/auth/me                 Token → UserInfo
POST   /api/auth/refresh            Refresh Token → New Token
GET    /api/users                   Lista usuarios
POST   /api/users                   Crear usuario
GET    /api/access/roles            Lista roles
GET    /api/dashboard/tenant/summary Resumen tenant
```

---

## 🎯 States Pattern (SIEMPRE usar este)

```typescript
data = signal<T | null>(null);
isLoading = signal(false);
error = signal<string | null>(null);

load() {
  this.isLoading.set(true);
  this.error.set(null);

  this.service.getData().subscribe({
    next: (d) => {
      this.data.set(d);
      this.isLoading.set(false);
    },
    error: (e) => {
      this.error.set('Error');
      this.isLoading.set(false);
    }
  });
}

// Template
@if (isLoading()) { <p>Cargando...</p> }
@else if (error()) { <p>{{ error() }}</p> }
@else { <!-- mostrar data --> }
```

---

## 🔄 Refresh Automático en 401

```typescript
// El authInterceptor lo maneja
// Si backend devuelve 401:
// 1. Intenta POST /api/auth/refresh
// 2. Si exitoso → reintenta petición original
// 3. Si falla → logout automático

// TÚ NO HACES NADA
```

---

## 💾 localStorage Keys

```
finance_access_token       // JWT
finance_refresh_token      // JWT
finance_tenant_slug        // "miempresa"

// Limpiados al logout
```

---

## ✅ Quick Test Checklist

- [ ] Backend running en 8080
- [ ] Frontend running en 4200
- [ ] Login funciona → redirige a /dashboard
- [ ] Tokens en localStorage
- [ ] Headers en Network tab
- [ ] Logout limpia tokens
- [ ] Sin token → redirect a /login

---

## 🆘 Error 401 en Console?

**Normal.** El interceptor intenta refresh automáticamente.

Si sucede constantemente:

1. Verifica `/api/auth/me` funciona
2. Verifica `/api/auth/refresh` funciona
3. Limpia localStorage

---

## 📚 Documents

```
QUICK_START.md               ← Lee primero (5 min)
AUTENTICACION_README.md      ← Funcionamiento
IMPLEMENTACION_RESUMEN.md    ← Flujos
EJEMPLOS_COMPONENTES.md      ← Copy-paste de servicios
PATRONES_CONVENCIONES.md     ← For consistency
INDICE_VISUAL.md            ← Este índice
```

---

## 💡 Key Concepts

**Signal**: `signal<T>(value)` → Reactividad sin RxJS  
**Observable**: Para streams async  
**Interceptor**: Automático, no toques  
**Guard**: Protege rutas  
**JWT**: Token stateless, en localStorage  
**FSD**: Feature-Sliced Design (carpetas por feature)

---

**Listo para copiar-pegar.** 🚀
