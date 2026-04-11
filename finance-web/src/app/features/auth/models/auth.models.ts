/**
 * Models for Authentication feature
 * DTOs aligned with the hexagonal backend:
 *   - identity/auth/application/dto/LoginRequest.java
 *   - identity/auth/application/dto/AuthTokenResponse.java
 *   - identity/auth/application/dto/AuthenticatedTenantUserResponse.java
 */

/** Matches: identity.auth.application.dto.LoginRequest */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Matches: identity.auth.application.dto.AuthTokenResponse */
export interface AuthTokenResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresInMs: number;
}

/** Matches: identity.auth.application.dto.AuthenticatedTenantUserResponse */
export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  status: string;
  tenantSlug: string;
  roles: string[];
}

/** Auth UI state */
export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
