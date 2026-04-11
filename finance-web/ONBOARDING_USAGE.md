# 🚀 Flujo de Registro Público - Guía de Uso

## 📋 Prerrequisitos

1. **Frontend corriendo**: `http://localhost:4200`
2. **Backend corriendo**: `http://localhost:8080` (para API)
3. **URL disponible**: `http://localhost:4200/signup`

## 🧪 Probar el Flujo de Registro

### Paso 1: Acceder al Registro

```
Navega a: http://localhost:4200/signup
O desde home: Click en "Registrarse" o "Comenzar"
```

### Paso 2: Completar Datos de Empresa

```
Sección 1: Datos de la Empresa
- Nombre: "Mi Empresa S.A."
- Identificador: Se genera automáticamente como "mi-empresa"
- O personalízalo: solo minúsculas, números, guiones
```

### Paso 3: Completar Datos del Admin

```
Sección 2: Datos del Administrador
- Nombre: "Juan"
- Apellido: "Pérez"
- Email: "admin@miempresa.com"
- Contraseña: "SecurePass123" (mín 8 chars, mayús, minús, número)
- Confirmar: Repite la contraseña
```

### Paso 4: Enviar y Verificar

```
Click "Registrar Empresa"
Verás:
- Spinner: "Registrando empresa..."
- Éxito: Check verde + mensaje + botón "Ir al Login"
- Error: Card roja con mensaje específico
```

## 🔧 Validaciones y Reglas

### TenantSlug (Identificador Único)

| Regla           | Ejemplo Válido  | Ejemplo Inválido |
| --------------- | --------------- | ---------------- |
| Solo minúsculas | `mi-empresa`    | `Mi-Empresa`     |
| Números ok      | `empresa123`    | -                |
| Guiones ok      | `mi-empresa-sa` | -                |
| Sin espacios    | `miempresa`     | `mi empresa`     |
| Sin especiales  | `empresa`       | `empresa!@#`     |

### Contraseña

- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula (A-Z)
- ✅ Al menos 1 minúscula (a-z)
- ✅ Al menos 1 número (0-9)

**Ejemplos válidos:**

- `Password123`
- `SecurePass1`
- `MyPass123`

**Ejemplos inválidos:**

- `password` (sin mayús ni número)
- `PASSWORD` (sin minús ni número)
- `Pass` (muy corta)

### Campos Obligatorios

- ❌ Todos los campos son requeridos
- ❌ Email debe tener formato válido
- ❌ Nombres mínimo 2 caracteres
- ❌ Contraseñas deben coincidir

## 🐛 Troubleshooting

### "Error al registrar la empresa"

**Posibles causas:**

- TenantSlug ya existe → Cambia el identificador
- Email ya registrado → Usa otro email
- Backend no responde → Verifica que esté corriendo

### "Las contraseñas no coinciden"

- Verifica que ambos campos sean idénticos
- Considera mayúsculas/minúsculas
- No hay espacios ocultos

### "Solo letras minúsculas, números y guiones"

- El tenantSlug es case-sensitive
- No uses: espacios, mayúsculas, acentos, símbolos
- Ejemplo correcto: `mi-empresa-2024`

### Formulario no envía

- Verifica que todos los campos estén completos
- Revisa mensajes de error en rojo
- Asegúrate de que las contraseñas coincidan

## 📊 Estados del Formulario

### Estado Loading

```
Spinner animado + texto "Registrando empresa..."
Botón deshabilitado
Formulario bloqueado
```

### Estado Error

```
Card roja con icono X
Mensaje específico del error
Formulario permanece editable
Usuario puede corregir y reintentar
```

### Estado Success

```
Check verde grande
Mensaje: "¡Registro exitoso!"
Texto explicativo
Botón "Ir al Login" → redirige a /login
```

## 🔗 Integración con Backend

### API Endpoint

```
POST /api/public/signup
Content-Type: application/json
Authorization: NONE (público)
```

### Request Body

```json
{
  "companyName": "Mi Empresa S.A.",
  "tenantSlug": "mi-empresa",
  "adminEmail": "admin@miempresa.com",
  "password": "SecurePass123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

### Response Success

```json
{
  "message": "Empresa registrada exitosamente",
  "tenantId": "uuid-del-tenant",
  "adminUserId": "uuid-del-admin"
}
```

### Response Error

```json
{
  "message": "El tenantSlug 'mi-empresa' ya está en uso"
}
```

## 🎨 UX/UI Features

### Generación Automática de Slug

- Escribe "Mi Empresa S.A." → genera "mi-empresa-sa"
- Remueve acentos: "Compañía" → "compania"
- Reemplaza espacios: "Mi Empresa" → "mi-empresa"

### Validación en Tiempo Real

- Mensajes aparecen al perder foco (onBlur)
- Bordes rojos para campos inválidos
- Mensajes específicos por tipo de error

### Responsive Design

- **Mobile**: Campos apilados, botones full-width
- **Tablet**: 2 columnas en secciones
- **Desktop**: Layout completo con gradiente

### Accesibilidad

- Labels descriptivos para todos los campos
- Placeholders útiles
- Estados de focus visibles
- Mensajes de error asociados a campos

## 🚀 Navegación y Flujo

### Flujo Normal

```
1. /signup (formulario)
2. Validaciones pasan
3. POST /api/public/signup
4. Success → Mensaje + botón "Ir al Login"
5. Click → /login
```

### Flujo con Error

```
1. /signup (formulario)
2. Validaciones fallan o API error
3. Mostrar error específico
4. Usuario corrige
5. Reintentar
```

### Navegación Alterna

- **Ya tengo cuenta**: Link a `/login`
- **Volver al home**: Link en header (si existe)
- **Desde pricing**: Parámetros opcionales

## 📈 Métricas y Analytics

El formulario está preparado para tracking:

- **Conversion rate**: Visitas → Registros exitosos
- **Abandon rate**: Campos donde users se van
- **Error rate**: Por tipo de validación
- **Time to complete**: Tiempo promedio

## 🎯 Próximos Pasos

1. **Email verification**: Código de 6 dígitos
2. **Plan selection**: Elegir plan durante registro
3. **Welcome email**: Template personalizado
4. **Onboarding flow**: Pasos post-registro
5. **Referral codes**: Sistema de referidos
6. **Multi-step wizard**: Separar en pasos

## 🎯 Patrón para Nuevos Formularios Públicos

Este registro sigue el patrón estándar:

- **Servicio público** sin auth headers
- **ReactiveForms** con validaciones estrictas
- **Signals** para estados de UI
- **Secciones lógicas** para UX
- **Auto-generación** de campos relacionados
- **Validación cruzada** entre campos

Úsalo como base para contact forms, newsletter signup, demo requests, etc.
