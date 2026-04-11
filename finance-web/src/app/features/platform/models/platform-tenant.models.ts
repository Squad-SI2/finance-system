export interface PlatformTenantResponse {
  id: string;
  name: string;
  slug: string;
  schemaName: string;
  status: string;
  planId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  planCode?: string;
}
