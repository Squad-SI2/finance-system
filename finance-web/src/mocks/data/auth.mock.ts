/**
 * Mock data for authentication
 * Simulates tenant and user data for testing
 */

export interface MockTenant {
  id: string;
  slug: string;
  name: string;
  adminUserId: string;
}

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Only in mock! Never do this in real app
  tenantSlug: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface MockSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantSlug: string;
  expiresAt: number;
}

// Simulated database with test data
export const mockTenants: MockTenant[] = [
  {
    id: 'tenant-1',
    slug: 'financruz',
    name: 'FinanCruz',
    adminUserId: 'user-1',
  },
  {
    id: 'tenant-2',
    slug: 'testcompany',
    name: 'Test Company',
    adminUserId: 'user-3',
  },
];

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'admin@financruz.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    password: 'admin123',
    tenantSlug: 'financruz',
    roles: ['ADMIN'],
    status: 'ACTIVE',
  },
  {
    id: 'user-2',
    email: 'user@financruz.com',
    firstName: 'María',
    lastName: 'García',
    password: 'user123',
    tenantSlug: 'financruz',
    roles: ['USER'],
    status: 'ACTIVE',
  },
  {
    id: 'user-3',
    email: 'admin@testcompany.com',
    firstName: 'Carlos',
    lastName: 'López',
    password: 'admin123',
    tenantSlug: 'testcompany',
    roles: ['ADMIN'],
    status: 'ACTIVE',
  },
  {
    id: 'user-4',
    email: 'manager@financruz.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    password: 'manager123',
    tenantSlug: 'financruz',
    roles: ['MANAGER'],
    status: 'ACTIVE',
  },
];

// Active sessions (in-memory storage for this mock)
export const mockSessions: Map<string, MockSession> = new Map();

// Token generator (simple mock)
export function generateMockToken(): string {
  return `mock-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Find user utilities
export function findUserByEmailAndTenant(email: string, tenantSlug: string): MockUser | undefined {
  return mockUsers.find(u => u.email === email && u.tenantSlug === tenantSlug);
}

export function findUserById(userId: string): MockUser | undefined {
  return mockUsers.find(u => u.id === userId);
}

export function findTenantBySlug(slug: string): MockTenant | undefined {
  return mockTenants.find(t => t.slug === slug);
}

export function findTenantUsers(tenantSlug: string): MockUser[] {
  return mockUsers.filter(u => u.tenantSlug === tenantSlug);
}

// Create new tenant and user (for signup)
export function createMockTenant(slug: string, name: string): MockTenant {
  const tenantId = `tenant-${Date.now()}`;
  const adminUserId = `user-${Date.now()}`;
  
  const newTenant: MockTenant = {
    id: tenantId,
    slug,
    name,
    adminUserId,
  };
  
  mockTenants.push(newTenant);
  return newTenant;
}

export function createMockUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  tenantSlug: string;
  roles: string[];
}): MockUser {
  const userId = `user-${Date.now()}`;
  
  const newUser: MockUser = {
    id: userId,
    ...data,
    status: 'PENDING',
  };
  
  mockUsers.push(newUser);
  return newUser;
}
