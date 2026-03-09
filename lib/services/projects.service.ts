/**
 * Projects Service — lib/services/projects.service.ts
 *
 * SRP: gestiona exclusivamente las operaciones del recurso /projects.
 * DIP: depende de httpClient (abstracción).
 *
 * Rutas anidadas bajo tenant: /tenants/:tenantId/projects
 */

import { httpClient, HttpClientOptions } from '@/lib/http/client';
import type {
  Project,
  ProjectDetail,
  CreateProjectDto,
  CreateProjectResponse,
} from '@/lib/types/project.types';

const tenantPath = (tenantId: string) => `/tenants/${tenantId}/projects`;

/** Lista todos los proyectos de un tenant. */
export async function getProjects(
  tenantId: string,
  options?: HttpClientOptions,
): Promise<Project[]> {
  const response = await httpClient.get<{ tenantId: string; projects: Project[] }>(
    tenantPath(tenantId),
    options,
  );
  return response.projects;
}

/** Obtiene el detalle completo de un proyecto (incluye hilos). */
export async function getProjectById(
  tenantId: string,
  projectId: string,
  options?: HttpClientOptions,
): Promise<ProjectDetail> {
  return httpClient.get<ProjectDetail>(
    `${tenantPath(tenantId)}/${projectId}`,
    options,
  );
}

/**
 * Crea un proyecto y su primer hilo atómicamente.
 * La respuesta incluye firstThread.threadId para empezar a chatear de inmediato.
 */
export async function createProject(
  tenantId: string,
  dto: CreateProjectDto,
  options?: HttpClientOptions,
): Promise<CreateProjectResponse> {
  return httpClient.post<CreateProjectResponse>(
    tenantPath(tenantId),
    dto,
    options,
  );
}
