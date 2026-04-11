## Guía de Verificación - Autenticación Real en Angular

Este documento explica cómo verificar que la autenticación real está funcionando correctamente.

### 1. Estructura de Archivos Creados

```
src/app/
├── features/auth/
│   ├── data-access/
│   │   └── auth.service.ts         ✅ Consumidor de endpoints /api/auth/
│   ├── models/
│   │   └── auth.models.ts          ✅ DTOs e interfaces de autenticación
│   └── pages/
│       └── login-page/
│           ├── login-page.ts       ✅ ACTUALIZADO - Consume AuthService
│           └── login-page.html     ✅ ACTUALIZADO - Formulario reactivo
├── core/
│   ├── interceptors/
│   │   └── auth.interceptor.ts     ✅ HttpInterceptor funcional
│   └── guards/
│       └── auth.guard.ts           ✅ Protección de rutas privadas
└── app.config.ts                   ✅ ACTUALIZADO - Incluye interceptor
└── app.routes.ts                   ✅ ACTUALIZADO - Protege /dashboard
```

### 2. Endpoints Consumidos del Backend

El AuthService consume estos endpoints del backend:

| Método | Endpoint            | Descripción                             |
| ------ | ------------------- | --------------------------------------- |
| POST   | `/api/auth/login`   | Autenticar usuario con email y password |
| GET    | `/api/auth/me`      | Obtener info del usuario autenticado    |
| POST   | `/api/auth/refresh` | Refrescar el token de acceso            |
| POST   | `/api/auth/logout`  | Logout del usuario                      |

**Headers requeridos:**

- `X-Tenant-Slug`: Identificador del tenant (ej: "financruz")
- `Authorization: Bearer <token>`: Token JWT en peticiones autenticadas

### 3. Flujo de Autenticación

#### A. Login

```
1. Usuario ingresa email, password y tenant slug en el formulario
2. LoginPage.onSubmit() llama a AuthService.login()
3. AuthService.login() hace POST a /api/auth/login con X-Tenant-Slug header
4. Backend devuelve { accessToken, refreshToken, tokenType }
5. AuthService guarda tokens en localStorage
6. AuthService llama a me() para obtener info del usuario
7. Router redirige a /dashboard
```

#### B. Peticiones HTTP Autenticadas

```
1. Toda petición HTTP pasa por authInterceptor
2. Si existe token en localStorage:
   - Agrega header: Authorization: Bearer <token>
   - Agrega header: X-Tenant-Slug: <slug>
3. Si backend devuelve 401:
   - authInterceptor intenta refrescar el token
   - Si refresh es exitoso, reintenta la petición original
   - Si refresh falla, hace logout automáticamente
```

#### C. Protección de Rutas

```
1. Rutas /dashboard están protegidas con authGuard
2. authGuard verifica si existe un token válido
3. Si no existe token:
   - Redirige a /login
   - Guarda URL original en queryParams (?returnUrl=...)
4. Si existe token:
   - Permite acceso a la ruta
```

### 4. Almacenamiento del Token

Los tokens se guardan en **localStorage** con las siguientes claves:

- `finance_access_token`: Token de acceso JWT
- `finance_refresh_token`: Token para refrescar acceso
- `finance_tenant_slug`: Identificador del tenant actual

**Nota**: localStorage es seguro para datos no altamente sensibles en SPAs. Para mayor seguridad, considera:

- Usar HttpOnly cookies si el backend lo soporta
- Implementar sessionStorage si prefieres que se limpie al cerrar la pestaña

### 5. Pasos para Probar en Postman

#### Paso 5.1: Hacer signup desde Postman

```
POST http://localhost:8080/api/public/signup
Headers:
  Content-Type: application/json

Body:
{
  "companyName": "test-corp",
  "tenantSlug": "testcorp",
  "adminEmail": "admin@testcorp.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "Admin"
}
```

#### Paso 5.2: Probar login desde la aplicación Angular

1. Navega a http://localhost:4200/login
2. Completa los campos:
   - Tenant: `testcorp`
   - Email: `admin@testcorp.com`
   - Contraseña: `Password123!`
3. Haz clic en "Ingresar"
4. Debes ser redirigido a `/dashboard`

#### Paso 5.3: Verificar tokens en el navegador

1. Abre DevTools (F12)
2. Ve a Application > LocalStorage > http://localhost:4200
3. Verifica que existan:
   - `finance_access_token`: Un JWT largo
   - `finance_refresh_token`: Un JWT largo
   - `finance_tenant_slug`: "testcorp"

#### Paso 5.4: Verificar headers en las peticiones

1. Abre DevTools (F12)
2. Ve a Network
3. Haz cualquier petición en el dashboard
4. Verifica en los headers:
   ```
   Authorization: Bearer eyJhbGc...
   X-Tenant-Slug: testcorp
   ```

### 6. Manejo de Errores

#### Error 401 - Token Expirado

```
Acción: El interceptor intenta refrescar el token automáticamente
Resultado: Si el refresh es exitoso, reintenta la petición original
           Si el refresh falla, hace logout y redirige a /login
```

#### Error 403 - Sin Permisos

```
El usuario no tiene permisos para la acción
Respuesta: El backend devuelve un error 403 que se propaga a la UI
```

#### Error de Login

```
Email o contraseña incorrectos, o tenant no existe
Respuesta: Se muestra en el formulario de login
           AuthService establece errorMessage$ con el mensaje
```

### 7. Señales Reactivas (Signals)

El AuthService usa Angular Signals para reactividad moderna:

```typescript
// En el componente LoginPage
email = signal('');           // Email ingresado
password = signal('');        // Contraseña ingresada
tenantSlug = signal('');      // Tenant slug ingresado
isLoading = signal(false);    // Estado de carga
errorMessage = signal(null);  // Mensaje de error

// En el template HTML, usa {{ signal() }} para acceder
<button [disabled]="isLoading()">
  {{ isLoading() ? 'Ingresando...' : 'Ingresar' }}
</button>
```

### 8. Servicios Utilizados

#### AuthService (data-access/auth.service.ts)

```typescript
// Métodos públicos
login(credentials, tenantSlug): Observable<AuthTokenResponse>
me(): Observable<MeResponse>
refreshToken(): Observable<AuthTokenResponse>
logout(): void
getAccessToken(): string | null
getTenantSlug(): string | null
isTokenValid(): boolean

// Signals públicos
user$: signal<UserInfo | null>
isAuthenticated$: signal<boolean>
isLoading$: signal<boolean>
error$: signal<string | null>
```

### 9. Próximos Pasos Recomendados

1. **Dashboard Tenant Page**
   - Consumir `/api/dashboard/tenant/summary` del backend
   - Mostrar plan, trial, límites de usuarios/roles

2. **Gestión de Usuarios**
   - Crear página para `/dashboard/users`
   - Consumir `/api/users` (GET, POST, PUT, PATCH)

3. **Gestión de Roles**
   - Crear página para `/dashboard/roles`
   - Consumir `/api/access/roles` (GET, POST, PUT, PATCH)

4. **Configuración del Tenant**
   - Crear página para `/dashboard/settings`
   - Consumir `/api/settings/tenant` (GET, PUT)

5. **Recuperación de Contraseña**
   - Agregar ruta `/forgot-password`
   - Consumir `/api/auth/forgot-password`
   - Consumir `/api/auth/reset-password`

### 10. Checklist de Verificación

- [ ] El formulario de login funciona
- [ ] Los tokens se guardan en localStorage
- [ ] El header `Authorization` se agrega a todas las peticiones
- [ ] El header `X-Tenant-Slug` se agrega a todas las peticiones
- [ ] Las rutas `/dashboard` están protegidas
- [ ] Sin token, se redirige a `/login`
- [ ] Error 401 dispara refresh automático
- [ ] Si refresh falla, se hace logout
- [ ] Los datos del usuario se muestran en el dashboard
- [ ] El logout limpia los tokens

---

**Nota**: Este es un sistema de autenticación funcional basado en JWT. Para producción, considera agregar:

- Validación de token expirado antes de enviar peticiones
- Manejo de errores de red más robusto
- Almacenamiento seguro con HttpOnly cookies
- Auditoría de logins y cambios de permisos
