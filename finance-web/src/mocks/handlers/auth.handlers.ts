import { http, HttpResponse } from 'msw';
import {
  findUserByEmailAndTenant,
  findUserById,
  generateMockToken,
  mockSessions,
  findTenantUsers,
} from '../data/auth.mock';

export const authHandlers = [
  /**
   * POST /api/auth/login
   * Login con email, password y tenantSlug
   */
  http.post('/api/auth/login', async ({ request }) => {
    const headers = request.headers;
    const tenantSlug = headers.get('X-Tenant-Slug');
    
    const body = await request.json() as {
      email: string;
      password: string;
    };

    // Validar que tenemos el tenant slug
    if (!tenantSlug) {
      return HttpResponse.json(
        { message: 'X-Tenant-Slug header is required' },
        { status: 400 }
      );
    }

    // Buscar usuario por email y tenant
    const user = findUserByEmailAndTenant(body.email, tenantSlug);

    // Validar credenciales
    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generar tokens
    const accessToken = generateMockToken();
    const refreshToken = generateMockToken();
    const expiresAt = Date.now() + 3600000; // 1 hora

    // Guardar sesión
    mockSessions.set(accessToken, {
      accessToken,
      refreshToken,
      userId: user.id,
      tenantSlug,
      expiresAt,
    });

    return HttpResponse.json({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    });
  }),

  /**
   * POST /api/auth/refresh
   * Renovar access token usando refresh token
   */
  http.post('/api/auth/refresh', async ({ request }) => {
    const body = await request.json() as {
      refreshToken: string;
    };

    // Buscar sesión con ese refresh token
    let session = Array.from(mockSessions.values()).find(
      s => s.refreshToken === body.refreshToken
    );

    if (!session) {
      return HttpResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generar nuevo access token
    const newAccessToken = generateMockToken();
    const expiresAt = Date.now() + 3600000; // 1 hora

    // Actualizar sesión
    mockSessions.delete(session.accessToken);
    session = {
      ...session,
      accessToken: newAccessToken,
      expiresAt,
    };
    mockSessions.set(newAccessToken, session);

    return HttpResponse.json({
      accessToken: newAccessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
    });
  }),

  /**
   * GET /api/auth/me
   * Obtener información del usuario autenticado
   */
  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    const tenantSlug = request.headers.get('X-Tenant-Slug');

    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = auth.substring(7);
    const session = mockSessions.get(token);

    if (!session) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validar que el tenant coincida
    if (tenantSlug && session.tenantSlug !== tenantSlug) {
      return HttpResponse.json(
        { message: 'Tenant mismatch' },
        { status: 403 }
      );
    }

    const user = findUserById(session.userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantSlug: user.tenantSlug,
        roles: user.roles,
      },
    });
  }),

  /**
   * POST /api/auth/logout
   * Logout del usuario
   */
  http.post('/api/auth/logout', ({ request }) => {
    const auth = request.headers.get('Authorization');

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      mockSessions.delete(token);
    }

    return HttpResponse.json({ message: 'Logged out successfully' });
  }),
];