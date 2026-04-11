import { http, HttpResponse } from 'msw';
import {
  findTenantBySlug,
  createMockTenant,
  createMockUser,
  mockUsers,
} from '../data/auth.mock';

export const publicHandlers = [
  /**
   * POST /api/public/signup
   * Registrar nueva empresa y administrador
   */
  http.post('/api/public/signup', async ({ request }) => {
    const body = await request.json() as {
      companyName: string;
      tenantSlug: string;
      adminEmail: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    // Validar que el tenant slug no exista
    if (findTenantBySlug(body.tenantSlug)) {
      return HttpResponse.json(
        { message: 'Tenant slug already exists' },
        { status: 400 }
      );
    }

    // Validar que no exista un usuario con ese email y tenant
    if (mockUsers.some(u => u.email === body.adminEmail && u.tenantSlug === body.tenantSlug)) {
      return HttpResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Crear nuevo tenant
    const newTenant = createMockTenant(body.tenantSlug, body.companyName);

    // Crear usuario administrador
    const adminUser = createMockUser({
      email: body.adminEmail,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
      tenantSlug: body.tenantSlug,
      roles: ['ADMIN'],
    });

    // Actualizar el estado del admin a ACTIVE
    adminUser.status = 'ACTIVE';

    return HttpResponse.json({
      message: 'Signup successful',
      tenantId: newTenant.id,
      adminUserId: adminUser.id,
    });
  }),
];
