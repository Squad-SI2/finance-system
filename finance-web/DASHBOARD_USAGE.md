# 🚀 Cómo Usar el Dashboard del Tenant

## 📋 Prerrequisitos

1. **Backend corriendo**: `http://localhost:8080`
2. **Frontend corriendo**: `http://localhost:4200`
3. **Usuario autenticado**: Token válido en localStorage

## 🧪 Probar el Dashboard

### Paso 1: Login

```
Navega a: http://localhost:4200/login
Ingresa credenciales válidas
→ Redirige automáticamente a /dashboard
```

### Paso 2: Ver Dashboard

```
URL: http://localhost:4200/dashboard
Deberías ver:
- Bienvenida con nombre del tenant
- 3 tarjetas: Plan, Suscripción, Usuarios
- Barra de progreso de usuarios
- Estados con colores apropiados
```

### Paso 3: Verificar API Call

```
Abre DevTools → Network
Busca petición a: /api/dashboard/tenant/summary
Verifica headers:
  - Authorization: Bearer <token>
  - X-Tenant-Slug: <slug>
```

## 🔧 Personalización

### Agregar Más Tarjetas

```html
<!-- En dashboard-page.html, dentro del grid -->
<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <!-- Tu nueva tarjeta -->
</div>
```

### Agregar Más Datos

```typescript
// En dashboard-page.ts
rolesProgress = computed(() => {
  const s = this.summary();
  return s ? (s.rolesCount / s.plan.maxRoles) * 100 : 0;
});
```

### Cambiar Colores

```typescript
// En dashboard-page.ts
getSubscriptionStatusClass(): string {
  // Personaliza colores aquí
  case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
  case 'TRIAL': return 'bg-sky-100 text-sky-800';
  // ...
}
```

## 🐛 Troubleshooting

### "Error cargando el resumen"

- Verifica que el backend esté corriendo
- Verifica que `/api/dashboard/tenant/summary` exista
- Revisa logs del backend

### "No se muestran datos"

- Verifica que el usuario esté logueado
- Verifica tokens en localStorage
- Revisa Network tab por errores 401

### "Barra de progreso no se ve"

- Verifica que `usersCount` y `maxUsers` sean números
- Revisa computed `usersProgress`

## 📈 Próximos Pasos

1. **Agregar navegación**: Botones para ir a Users, Roles, Settings
2. **Gráficos**: Usar Chart.js para métricas visuales
3. **Acciones rápidas**: Botones para crear usuario, rol, etc.
4. **Notificaciones**: Toast para acciones exitosas

## 🎯 Patrón para Nuevas Features

Este Dashboard sigue el patrón estándar:

- **Service** en `data-access/` para API calls
- **Component** en `pages/` con Signals
- **Template** con TailwindCSS moderno
- **Estados**: loading, error, data

Úsalo como base para Users, Roles, Settings features.
