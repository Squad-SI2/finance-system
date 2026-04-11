import { http, HttpResponse } from 'msw';
import {
  mockSessions,
  findUserById,
  findTenantBySlug,
  findTenantUsers,
} from '../data/auth.mock';

export const dashboardHandlers = [
  /**
   * GET /api/dashboard/tenant/summary
   * Obtener resumen del tenant actual
   */
  http.get('/api/dashboard/tenant/summary', ({ request }) => {
    const auth = request.headers.get('Authorization');
    const tenantSlug = request.headers.get('X-Tenant-Slug');

    // Validar autenticación
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.substring(7);
    const session = mockSessions.get(token);

    if (!session) {
      return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Obtener información del tenant
    const tenant = findTenantBySlug(session.tenantSlug);
    if (!tenant) {
      return HttpResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    // Obtener usuarios del tenant
    const tenantUsers = findTenantUsers(session.tenantSlug);
    const user = findUserById(session.userId);

    return HttpResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      plan: {
        code: 'PREMIUM',
        name: 'Plan Premium',
        maxUsers: 50,
      },
      subscription: {
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      usersCount: tenantUsers.length,
      rolesCount: 3,
      canCreateUsers: tenantUsers.length < 50,
      canCreateRoles: true,
      alerts: tenantUsers.length > 40 ? ['You are nearing your user limit'] : [],
    });
  }),
];
