'use client';

/**
 * Projects Repository — lib/repositories/projects.repository.ts
 *
 * Capa de abstracción sobre SWR para los recursos /projects y /tenants.
 *
 * SRP: encapsula el caching con SWR. Los componentes no necesitan
 *      conocer los detalles de SWR ni de los endpoints.
 * DIP: importa los servicios (abstracción), no hace fetch directamente.
 * OCP: se puede extender añadiendo hooks sin modificar los existentes.
 */

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { getProjects } from '@/lib/services/projects.service';
import { getMyTenants } from '@/lib/services/tenants.service';
import type { Project } from '@/lib/types/project.types';
import type { UserTenantMembership } from '@/lib/types/tenant.types';

// ─── Fetchers puros (sin hooks — reutilizables y testeables) ─────────────────

/** Fetcher para obtener los proyectos de un tenant. */
export const fetchProjects = (
  tenantId: string,
  token: string | null,
): Promise<Project[]> => getProjects(tenantId, { token });

/** Fetcher para obtener los tenants del usuario autenticado. */
export const fetchMyTenants = (
  token: string | null,
): Promise<UserTenantMembership[]> => getMyTenants({ token });

// ─── SWR Hooks ────────────────────────────────────────────────────────────────

/**
 * Hook para listar proyectos de un tenant con revalidación automática.
 * @param tenantId - ID del tenant. Si es null, el hook queda en standby.
 * @param token    - Bearer token de Clerk.
 * @param config   - Configuración SWR adicional (opcional).
 */
export function useProjects(
  tenantId: string | null,
  token: string | null,
  config?: SWRConfiguration<Project[]>,
) {
  return useSWR<Project[]>(
    tenantId && token ? ['projects', tenantId] : null,
    ([, id]) => getProjects(id as string, { token }),
    {
      revalidateOnFocus: false,
      ...config,
    },
  );
}

/**
 * Hook para obtener los tenants del usuario autenticado.
 * Se usa principalmente para resolver tenantId en el dashboard.
 * @param token  - Bearer token de Clerk.
 * @param config - Configuración SWR adicional (opcional).
 */
export function useMyTenants(
  token: string | null,
  config?: SWRConfiguration<UserTenantMembership[]>,
) {
  return useSWR<UserTenantMembership[]>(
    token ? ['tenants', 'me'] : null,
    () => getMyTenants({ token }),
    {
      revalidateOnFocus: false,
      ...config,
    },
  );
}
