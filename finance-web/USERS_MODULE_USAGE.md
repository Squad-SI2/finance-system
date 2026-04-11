# 🚀 Gestión de Usuarios - Guía de Uso

## 📋 Prerrequisitos

1. **Backend corriendo**: `http://localhost:8080`
2. **Frontend corriendo**: `http://localhost:4200`
3. **Usuario autenticado**: Admin o Manager
4. **URLs disponibles**:
   - Lista: `http://localhost:4200/users`
   - Crear: `http://localhost:4200/users/create`

## 🧪 Probar el Módulo

### Paso 1: Acceder a Usuarios

```
Desde el dashboard → Navega a /users
O directamente: http://localhost:4200/users
```

### Paso 2: Ver Lista de Usuarios

```
Deberías ver:
- Header con título y botón "Nuevo Usuario"
- Tabla con columnas: Usuario, Rol, Estado, Creado, Último Acceso, Acciones
- Estados con colores: Verde (Activo), Rojo (Inactivo), Amarillo (Pendiente)
```

### Paso 3: Crear Usuario

```
1. Click "Nuevo Usuario"
2. Llena el formulario:
   - Nombre: mínimo 2 caracteres
   - Apellido: mínimo 2 caracteres
   - Email: formato válido
   - Password: mínimo 8 caracteres
   - Rol: USER/MANAGER/ADMIN
3. Click "Crear Usuario"
4. Verás mensaje de éxito y redirección automática
```

### Paso 4: Cambiar Estado

```
En la tabla, click "Activar/Desactivar/Pendiente"
El estado cambia inmediatamente en la UI
```

## 🔧 Personalización

### Agregar Más Estados

```typescript
// En users.service.ts
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
```

### Nuevos Campos en Formulario

```typescript
// En user-create.component.ts
this.userForm.addControl(
  'phone',
  new FormControl('', Validators.pattern(/^\+?[\d\s-]+$/))
);
```

### Filtros en Lista

```typescript
// En users-list.component.ts
readonly statusFilter = signal<UserStatus | 'ALL'>('ALL');
readonly roleFilter = signal<UserRole | 'ALL'>('ALL');
```

## 🐛 Troubleshooting

### "Error cargando usuarios"

- Verifica que `/api/users` existe
- Revisa headers: `Authorization` y `X-Tenant-Slug`
- Backend debe devolver array de usuarios

### "Error creando usuario"

- Verifica que `/api/users` acepta POST
- Campos requeridos: firstName, lastName, email, password, role
- Email debe ser único en el tenant

### "Error actualizando estado"

- Verifica que `/api/users/{id}/status` existe
- Método PATCH con body: `{ "status": "ACTIVE|INACTIVE|PENDING" }`

### Formulario no valida

- **Nombre/Apellido**: Mínimo 2 caracteres
- **Email**: Formato válido (usuario@dominio.com)
- **Password**: Mínimo 8 caracteres
- **Rol**: Seleccionar de la lista

## 📊 Estados de Usuario

| Estado   | Color    | Descripción                         |
| -------- | -------- | ----------------------------------- |
| ACTIVE   | Verde    | Usuario puede acceder al sistema    |
| INACTIVE | Rojo     | Usuario bloqueado, no puede acceder |
| PENDING  | Amarillo | Usuario creado pero no activado     |

## 👥 Roles de Usuario

| Rol     | Descripción   | Permisos                      |
| ------- | ------------- | ----------------------------- |
| ADMIN   | Administrador | Todo acceso                   |
| MANAGER | Gerente       | Gestión de usuarios, reportes |
| USER    | Usuario       | Acceso limitado               |

## 🎨 UI/UX Features

### Estados de Carga

- **Lista**: Spinner + "Cargando usuarios..."
- **Crear**: Spinner en botón + "Creando usuario..."
- **Actualizar**: Cambio inmediato en UI

### Estados de Error

- **Lista**: Card roja con mensaje
- **Crear**: Card roja encima del formulario
- **Actualizar**: Console error (podría agregar toast)

### Estados de Éxito

- **Crear**: Card verde + redirección automática
- **Actualizar**: Cambio visual inmediato

### Empty States

- **Sin usuarios**: Ilustración + CTA "Crear Usuario"
- **Responsive**: Tabla scrollable en móviles

## 🔗 Integración con Dashboard

El módulo está integrado en `dashboard.routes.ts`:

```typescript
{
  path: 'users',
  loadChildren: () => import('../users/users.routes').then(m => m.USERS_ROUTES)
}
```

### Navegación

- **Desde Dashboard**: Link o botón a `/users`
- **Dentro del módulo**: RouterLink para navegación interna
- **Volver**: Router.navigate() para redirecciones

## 📈 Métricas y Analytics

El módulo está preparado para agregar:

- **Contadores**: Total usuarios, activos, etc.
- **Gráficos**: Distribución por rol/estado
- **Auditoría**: Logs de cambios de estado
- **Notificaciones**: Emails de bienvenida

## 🎯 Patrón para Nuevos Módulos

Este módulo sigue el patrón estándar:

- **Service** en `data-access/` para APIs
- **Componentes** en `pages/` con Signals
- **Rutas** separadas con lazy loading
- **Integración** via `loadChildren`
- **Standalone components** con imports específicos

Úsalo como base para Roles, Permisos, Configuración, etc.
