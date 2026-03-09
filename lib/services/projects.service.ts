/**
 * Projects Service — lib/services/projects.service.ts
 *
 * SRP: gestiona exclusivamente las operaciones del recurso /projects.
 * DIP: depende de httpClient (abstracción).
 */

import { httpClient, HttpClientOptions } from '@/lib/http/client';
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from '@/lib/types/project.types';

const BASE_PATH = '/api/projects';

/** Lista todos los proyectos del usuario autenticado. */
export async function getProjects(options?: HttpClientOptions): Promise<Project[]> {
  return httpClient.get<Project[]>(BASE_PATH, options);
}

/** Obtiene un proyecto por ID. */
export async function getProjectById(
  id: string,
  options?: HttpClientOptions,
): Promise<Project> {
  return httpClient.get<Project>(`${BASE_PATH}/${id}`, options);
}

/** Crea un nuevo proyecto. */
export async function createProject(
  dto: CreateProjectDto,
  options?: HttpClientOptions,
): Promise<Project> {
  return httpClient.post<Project>(BASE_PATH, dto, options);
}

/** Actualiza parcialmente un proyecto existente. */
export async function updateProject(
  id: string,
  dto: UpdateProjectDto,
  options?: HttpClientOptions,
): Promise<Project> {
  return httpClient.patch<Project>(`${BASE_PATH}/${id}`, dto, options);
}

/** Elimina un proyecto por ID. */
export async function deleteProject(
  id: string,
  options?: HttpClientOptions,
): Promise<void> {
  return httpClient.delete<void>(`${BASE_PATH}/${id}`, options);
}
