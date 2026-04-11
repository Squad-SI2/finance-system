# 🏗️ PATRONES Y CONVENCIONES - Guía para Futuras Implementaciones

Este documento define los patrones y convenciones para mantener la arquitectura FSD consistente.

---

## 📂 Estructura FSD - Dónde Va Cada Cosa

### Cuando Crees una Nueva Feature (ej: Users)

```
src/app/features/users/
├── data-access/
│   ├── users.service.ts          ← Consumidor de API
│   └── users-state.service.ts    ← (Opcional) Estado compartido
├── models/
│   └── user.models.ts            ← DTOs e interfaces
├── pages/
│   ├── users-list/
│   │   ├── users-list.ts         ← Componente contenedor
│   │   ├── users-list.html       ← Template
│   │   └── users-list.css        ← Estilos
│   └── user-detail/
│       ├── user-detail.ts
│       ├── user-detail.html
│       └── user-detail.css
├── ui/
│   └── user-item.ts              ← (Opcional) Componentes reutilizables
└── users.routes.ts               ← Rutas de la feature
```

### Ejemplo Completo: Feature "Users"

**Paso 1: Crear modelo**

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

**Paso 2: Crear servicio**

```typescript
// users/data-access/users.service.ts
@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // El interceptor automáticamente agrega headers
  }
}
```

**Paso 3: Crear componente page**

```typescript
// users/pages/users-list/users-list.ts
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
})
export class UsersListPage {
  service = inject(UsersService);
  users = signal<User[]>([]);

  constructor() {
    this.service.getUsers().subscribe((u) => this.users.set(u));
  }
}
```

**Paso 4: Crear rutas**

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

**Paso 5: Agregar al dashboard routing**

```typescript
// dashboard/dashboard.routes.ts
{
  path: 'users',
  loadChildren: () =>
    import('./features/users/users.routes').then(m => m.USERS_ROUTES)
}
```

---

## 🎨 Componentes UI Reutilizables

Cuando crees un componente que se reutiliza (no es page):

```
features/users/
└── ui/
    ├── user-item/
    │   ├── user-item.ts
    │   ├── user-item.html
    │   └── user-item.css
    └── user-form/
        ├── user-form.ts
        ├── user-form.html
        └── user-form.css
```

**Patrón:**

```typescript
// users/ui/user-item/user-item.ts
@Component({
  selector: 'app-user-item',
  standalone: true,
  inputs: ['user'],  // ← Entrada
  outputs: {
    edit: new EventEmitter<User>(),  // ← Salida
    delete: new EventEmitter<string>()
  }
})
export class UserItem {
  user = input<User>();

  onEdit() {
    this.edit.emit(this.user());
  }
}

// En otro componente:
<app-user-item
  [user]="user"
  (edit)="handleEdit($event)"
  (delete)="handleDelete($event)">
</app-user-item>
```

---

## 🔄 Flujo de Datos (Data Flow)

### Patrón: Service → Component → Template

```
┌─────────────────────────────────────────────────────────┐
│ Service (data-access/users.service.ts)                  │
│ - Consume API (/api/users)                              │
│ - Devuelve Observable<User[]>                           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ Component (pages/users-list/users-list.ts)              │
│ - Inyecta Service                                        │
│ - Suscribe a Observable                                  │
│ - Actualiza signal: users = signal<User[]>              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ Template (users-list.html)                              │
│ - Lee signal: {{ users() }}                              │
│ - Renderiza datos                                        │
│ - Emite eventos (click, submit, etc)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ Con evento (delete, edit, etc)                           │
│ - Componente ejecuta método                              │
│ - Método llama a Service                                 │
│ - Service consume API                                    │
│ - Recargar datos                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Seguridad - Patrones de Validación

### Validar en el Frontend (UX)

```typescript
// No envíar petición si hay errores básicos
if (!this.email() || !this.password()) {
  this.error.set('Campo requerido');
  return; // No llama al servicio
}
```

### Confiar en Backend (Seguridad)

```typescript
// El backend siempre hace validaciones
// El frontend solo agrega UX
this.service.createUser(data).subscribe({
  error: (err) => {
    // Backend devuelve mensaje de error
    this.error.set(err.error.message);
  },
});
```

---

## 🚀 Patrones para Async Operations

### Patrón Simple (Signals)

```typescript
isLoading = signal(false);
error = signal<string | null>(null);

loadUsers() {
  this.isLoading.set(true);
  this.error.set(null);

  this.service.getUsers().subscribe({
    next: (data) => {
      this.users.set(data);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.error.set('Error cargando');
      this.isLoading.set(false);
    }
  });
}
```

### Patrón Avanzado (RxJS + Signals)

```typescript
private refresh$ = new Subject<void>();

users$ = this.refresh$.pipe(
  startWith(undefined),
  switchMap(() => this.service.getUsers()),
  shareReplay(1)
);

users = toSignal(this.users$, { initialValue: [] });

delete(id: string) {
  this.service.deleteUser(id).subscribe(() => {
    this.refresh$.next(); // Recargar lista
  });
}
```

---

## 📋 Convenciones de Nombres

### Archivos

```
✅ users.service.ts          (snake-case con sufijo)
✅ user.models.ts            (singular para DTOs)
✅ users-list.ts             (kebab-case para componentes)
✅ users.routes.ts           (feature name + .routes)

❌ Users.service.ts          (No PascalCase para servicios)
❌ user-models.ts            (No singular sin sufijo)
```

### Métodos HTTP en Service

```typescript
class UsersService {
  // ✅ Nombres claros
  getUsers(): Observable<User[]>;
  getUser(id: string): Observable<User>;
  createUser(data): Observable<User>;
  updateUser(id, data): Observable<User>;
  deleteUser(id): Observable<void>;

  // ❌ Nombres malos
  fetch(): Observable<User[]>; // ¿Qué fetch?
  save(data): Observable<User>; // ¿Crear o actualizar?
  remove(id): Observable<void>; // Usa delete, es mayor claridad
}
```

### Signals

```typescript
class MyComponent {
  // ✅ Claro
  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ❌ Ambiguo
  data = signal(...);              // ¿Qué datos?
  status = signal(...);             // ¿Qué estado?
}
```

---

## 🎬 Estados de Carga - Patrón Estándar

```typescript
@Component({
  template: `
    @if (isLoading()) {
      <p>Cargando...</p>
    } @else if (error()) {
      <div class="error">{{ error() }}</div>
    } @else if (data()) {
      <!-- Mostrar datos -->
    } @else {
      <p>Sin datos</p>
    }
  `,
})
export class MyComponent {
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
      },
    });
  }
}
```

---

## 🧪 Testing - Patrones

### Test de Service

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersService]
    });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should get users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
    });

    const req = http.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([...]);
  });
});
```

### Test de Componente

```typescript
describe('UsersListPage', () => {
  it('should display users', () => {
    const fixture = TestBed.createComponent(UsersListPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Users');
  });
});
```

---

## 🔗 Inyección de Dependencias - Patrones

### ✅ Correcto

```typescript
export class MyComponent {
  authService = inject(AuthService);
  usersService = inject(UsersService);
  router = inject(Router);
}
```

### ❌ Antiguo (Constructor)

```typescript
export class MyComponent {
  constructor(
    private auth: AuthService,
    private users: UsersService,
    private router: Router
  ) {}
}
```

Usa `inject()` en componentes standalone.

---

## 📊 Cuándo Usar Qué

### Signal vs Observable

```typescript
// Usa Signal para:
// - Estado local del componente
// - Datos que necesitan renderizar
userData = signal<User | null>(null);

// Usa Observable para:
// - Streams de datos
// - Cambios externos
// - Operadores RxJS
userData$ = this.service.getUser();
```

### Service vs Component Logic

```typescript
// En Service:
// - Llamadas HTTP
// - Transformaciones de datos
// - Estado compartido

// En Component:
// - Lógica de UI
// - Manejo de formularios
// - Navigation
// - Estado LOCAL al componente
```

---

## 🚨 Anti-Patterns a Evitar

```typescript
❌ NO hacer:
export class MyComponent {
  @Input() data: any;           // Usa signals
  ngDoCheck() { ... }           // Usa effect()
  async pipe | json pipe        // Usa signals()
  private field = new Subject() // Hace código complejo

  constructor(private s: S) {}  // Usa inject()
}

✅ HACER:
export class MyComponent {
  data = input<Type>();        // Signal input
  effect(() => { ... })         // Reacciones
  {{ data() | formatDate }}     // Direct signal
  signal<T>(null)              // Simple state

  service = inject(Service);    // Injection moderna
}
```

---

## 📝 Resumen de Checklist para Nueva Feature

- [ ] Crear carpeta en `features/<feature-name>/`
- [ ] Crear `models/<feature>.models.ts`
- [ ] Crear `data-access/<feature>.service.ts`
- [ ] Crear `pages/<feature>-list/<feature>-list.ts`
- [ ] Crear `<feature>.routes.ts`
- [ ] Agregar rutas al padre (dashboard.routes.ts)
- [ ] Usar signals para estado
- [ ] El interceptor maneja los headers automáticamente
- [ ] Manejo de loading y error en template
- [ ] Tests unitarios del service

---

**Mantén la convención consistente y el código será escalable.** 🚀
