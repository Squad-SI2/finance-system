# ⚡ QUICK START - Autenticación Real Angular

**¿Solo necesitas saber cómo empezar?** Lee esto en 5 minutos.

## 📦 ¿Qué se implementó?

✅ **AuthService** - Maneja login/logout/me  
✅ **HttpInterceptor** - Agrega token automáticamente a todas las requests  
✅ **AuthGuard** - Protege rutas privadas  
✅ **Login Page** - Formulario reactivo consumiendo backend  
✅ **localStorage** - Guardando JWT seguro

---

## 🚀 Empezar en 3 pasos

### 1. Inicia tu backend (Java)

```bash
cd finance-api
./mvnw spring-boot:run
# Backend en http://localhost:8080
```

### 2. Inicia tu frontend (Angular)

```bash
cd finance-web
npm install
npm start
# Frontend en http://localhost:4200
```

### 3. Navega a login y prueba

```
http://localhost:4200/login
```

---

## 🧪 Prueba Rápida

**Crear cuenta desde cero:**

1. Abre Postman: `POST http://localhost:8080/api/public/signup`

```json
{
  "companyName": "Mi Empresa",
  "tenantSlug": "miempresa",
  "adminEmail": "admin@miempresa.com",
  "password": "Password123!",
  "firstName": "Admin",
  "lastName": "Test"
}
```

2. Ve a `http://localhost:4200/login`

3. Ingresa:

```
Tenant: miempresa
Email: admin@miempresa.com
Password: Password123!
```

4. Click "Ingresar" → ¡Redirige a `/dashboard`! ✅

---

## 📁 Dónde Están los Archivos

```
src/app/
├── features/auth/
│   ├── data-access/auth.service.ts
│   ├── models/auth.models.ts
│   └── pages/login-page/
│
├── core/
│   ├── interceptors/auth.interceptor.ts
│   └── guards/auth.guard.ts
│
└── app.config.ts (actualizado)
└── app.routes.ts (actualizado)
```

---

## 💡 Conceptos Clave

### 1. AuthService

Inyéctalo en cualquier componente:

```typescript
import { AuthService } from '@features/auth/data-access/auth.service';

export class MyComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout(); // Limpia tokens y redirige a /login
  }

  getUser() {
    console.log(this.authService.user$());
  }
}
```

### 2. HttpInterceptor

Funciona automáticamente:

- ✅ Agrega `Authorization: Bearer <token>` a todas las requests
- ✅ Agrega `X-Tenant-Slug: <slug>` a todas las requests
- ✅ Si error 401 → intenta refrescar token
- ✅ Si refresh falla → logout automático

**No necesitas hacer nada**, funciona transparente.

### 3. AuthGuard

Protege rutas:

```typescript
// En app.routes.ts
{
  path: 'dashboard',
  canActivate: [authGuard],  // ← Listo
  loadChildren: () => ...
}
```

Si no hay token → redirige a `/login`

### 4. LocalStorage

Los tokens se guardan así:

```
finance_access_token = "eyJhbGc..."
finance_refresh_token = "eyJhbGc..."
finance_tenant_slug = "miempresa"
```

Automáticamente limpiados al logout.

---

## 🔗 Endpoints Que Necesitas del Backend

Asegúrate que el backend tenga estos listos:

| Endpoint            | Método | Qué hace                               |
| ------------------- | ------ | -------------------------------------- |
| `/api/auth/login`   | POST   | Devuelve `{accessToken, refreshToken}` |
| `/api/auth/me`      | GET    | Devuelve usuario actual                |
| `/api/auth/refresh` | POST   | Devuelve nuevo `accessToken`           |
| `/api/auth/logout`  | POST   | Logout (opcional)                      |

**Headers esperados:**

- `X-Tenant-Slug: miempresa` (en todas)
- `Authorization: Bearer <token>` (en protegidas)

---

## 📝 Ejemplo: Crear Componente con Datos Protegidos

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-data',
  template: ` {{ data() | json }} `,
})
export class MyData {
  http = inject(HttpClient);
  data = signal<any>(null);

  constructor() {
    // El interceptor AUTOMÁTICAMENTE agrega los headers
    this.http
      .get('/api/dashboard/tenant/summary')
      .subscribe((result) => this.data.set(result));
  }
}
```

**Eso es todo.** El interceptor se encarga del resto.

---

## ✅ Checklist Rápido

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] Frontend corriendo en `http://localhost:4200`
- [ ] Prueba `/login` con credenciales
- [ ] Verifica tokens en DevTools → Application → LocalStorage
- [ ] Verifica headers en Network tab
- [ ] Prueba logout → debe limpiar tokens
- [ ] Intenta acceder a `/dashboard` sin token → debe redirigir a `/login`

---

## 🆘 Si Algo No Funciona

### "Error: Expected accessToken in response"

→ Backend no devuelve `accessToken` en `/api/auth/login`  
→ Asegúrate que el backend devuelva: `{ "accessToken": "...", "refreshToken": "..." }`

### "401 Unauthorized en el debugger"

→ Normal. El interceptor intenta refrescar automáticamente  
→ Si sigue fallando, el logout ocurrirá automáticamente

### "Redirige a login sin razón"

→ Probablemente el token está expirado  
→ Limpia localStorage manualmente en DevTools

### "Header X-Tenant-Slug no aparece"

→ Verifica que `AuthService.getTenantSlug()` devuelva algo  
→ Si no, guarda el tenant después del login

---

## 🎯 Siguiente Paso Natural

1. Crea un `DashboardService` que consuma `/api/dashboard/tenant/summary`
2. Muestra plan, trial, límites en DashboardPage
3. Crea pages para Users, Roles, Settings
4. Los servicios heredarán automáticamente los headers

Ver `EJEMPLOS_COMPONENTES.md` para copypaste de servicios.

---

## 📚 Documentación Completa

- `AUTENTICACION_README.md` - Flujos detallados
- `IMPLEMENTACION_RESUMEN.md` - Arquitectura y diagramas
- `EJEMPLOS_COMPONENTES.md` - Servicios y componentes listos

---

**Listo para usar. No hay más setup.** 🚀
