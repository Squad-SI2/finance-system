import { http, HttpResponse } from 'msw';
import {
  mockUsers,
  findTenantUsers,
  mockSessions,
  createMockUser,
} from '../data/auth.mock';

export const usersHandlers = [
  /**
   * GET /api/users
   * Obtener lista de usuarios del tenant
   */
  http.get('/api/users', ({ request }) => {
    const auth = request.headers.get('Authorization');

    // Validar autenticación
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.substring(7);
    const session = mockSessions.get(token);

    if (!session) {
      return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Obtener usuarios del tenant
    const tenantUsers = findTenantUsers(session.tenantSlug);

    return HttpResponse.json(tenantUsers.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.roles[0] || 'USER',
      status: u.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })));
  }),

  /**
   * POST /api/users
   * Crear nuevo usuario en el tenant
   */
  http.post('/api/users', async ({ request }) => {
    const auth = request.headers.get('Authorization');

    // Validar autenticación
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.substring(7);
    const session = mockSessions.get(token);

    if (!session) {
      return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json() as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
    };

    // Validar que no exista un usuario con ese email
    if (mockUsers.some(u => u.email === body.email && u.tenantSlug === session.tenantSlug)) {
      return HttpResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Crear usuario
    const newUser = createMockUser({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
      tenantSlug: session.tenantSlug,
      roles: [body.role],
    });

    return HttpResponse.json({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.roles[0],
      status: newUser.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  /**
   * PATCH /api/users/:id/status
   * Actualizar estado de un usuario
   */
  http.patch('/api/users/:id/status', async ({ request, params }) => {
    const auth = request.headers.get('Authorization');
    const userId = params['id'] as string;

    // Validar autenticación
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.substring(7);
    const session = mockSessions.get(token);

    if (!session) {
      return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json() as { status: string };

    // Buscar usuario
    const user = mockUsers.find(u => u.id === userId && u.tenantSlug === session.tenantSlug);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Actualizar estado
    user.status = body.status as any;

    return HttpResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.roles[0],
      status: user.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
];