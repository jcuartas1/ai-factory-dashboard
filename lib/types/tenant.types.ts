/**
 * Tipos de dominio para Tenants — lib/types/tenant.types.ts
 *
 * Basado en: FRONTEND_INTEGRATION_GUIDE.md v1.0
 * Rutas: POST /tenants · GET /tenants/me · PATCH /tenants/:id
 */

/** Estados del ciclo de vida de un tenant. */
export type TenantStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED';

/** Rol del usuario dentro de un tenant específico. */
export type TenantRole = 'ADMIN' | 'EDITOR' | 'ANALYST';

/**
 * Respuesta de POST /tenants y PATCH /tenants/:id.
 * Representa la entidad Tenant en crudo.
 */
export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
}

/**
 * Ítem de la respuesta de GET /tenants/me.
 * Combina datos del tenant con el rol del usuario autenticado en ese tenant.
 */
export interface UserTenantMembership {
  tenantId: string;
  tenantName: string;
  tenantStatus: TenantStatus;
  role: TenantRole;
  joinedAt: string;
}

/** DTO para crear un tenant (POST /tenants). */
export interface CreateTenantDto {
  name: string;
}

/** DTO para actualizar un tenant (PATCH /tenants/:id). */
export interface UpdateTenantDto {
  name: string;
}
