/**
 * Tipos de dominio para Proyectos — lib/types/project.types.ts
 */

export type ProjectStatus =
  | 'draft'
  | 'generating'
  | 'deploying'
  | 'deployed'
  | 'failed';

/** Entidad Project tal como la devuelve la API. */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** DTO para crear un proyecto (POST /projects). */
export interface CreateProjectDto {
  name: string;
  description: string;
}

/** DTO para actualizar un proyecto (PATCH /projects/:id). */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
