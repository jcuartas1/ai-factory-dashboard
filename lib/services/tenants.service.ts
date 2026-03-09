/**
 * Tenants Service — lib/services/tenants.service.ts
 *
 * SRP: gestiona exclusivamente las operaciones del recurso /tenants.
 * DIP: depende de httpClient (abstracción).
 */

import { httpClient, HttpClientOptions } from '@/lib/http/client';
import type {
  Tenant,
  UserTenantMembership,
  CreateTenantDto,
  UpdateTenantDto,
} from '@/lib/types/tenant.types';

/**
 * Crea un nuevo tenant.
 * Requiere GlobalRole BUSINESS_OWNER o SUPER_ADMIN.
 * El status inicial siempre es PENDING_PAYMENT.
 */
export async function createTenant(
  dto: CreateTenantDto,
  options?: HttpClientOptions,
): Promise<Tenant> {
  return httpClient.post<Tenant>('/tenants', dto, options);
}

/**
 * Lista todos los tenants a los que pertenece el usuario autenticado
 * junto con su rol en cada uno.
 * Retorna [] si el usuario no pertenece a ningún tenant.
 */
export async function getMyTenants(
  options?: HttpClientOptions,
): Promise<UserTenantMembership[]> {
  return httpClient.get<UserTenantMembership[]>('/tenants/me', options);
}

/**
 * Actualiza el nombre de un tenant.
 * Requiere rol de tenant ADMIN o EDITOR.
 */
export async function updateTenant(
  tenantId: string,
  dto: UpdateTenantDto,
  options?: HttpClientOptions,
): Promise<Tenant> {
  return httpClient.patch<Tenant>(`/tenants/${tenantId}`, dto, options);
}
