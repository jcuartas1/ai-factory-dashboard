/**
 * Tipos de dominio para Proyectos — lib/types/project.types.ts
 *
 * Basado en: FRONTEND_INTEGRATION_GUIDE.md v1.0
 * Rutas: /tenants/:tenantId/projects (recursos anidados bajo tenant)
 */

export type ProjectStatus =
  | 'DRAFT'
  | 'UX_DESIGN'
  | 'CODING'
  | 'REVIEWING'
  | 'DEPLOYED';

export type ProjectSource = 'NEW_GENERATED' | 'GITHUB_IMPORTED';

/** Hilo de chat (resumen) dentro de un proyecto. */
export interface Thread {
  threadId: string;
  title: string;
  status: 'OPEN' | 'RESOLVING' | 'PR_CREATED' | 'MERGED' | 'CLOSED';
  createdAt: string;
}

/** Primer hilo creado atómicamente junto al proyecto. */
export interface FirstThread {
  threadId: string;
  title: string;
  status: Thread['status'];
}

/** Entidad Project en la lista (GET /tenants/:id/projects). */
export interface Project {
  projectId: string;
  name: string;
  status: ProjectStatus;
  sourceType: ProjectSource;
  threadCount: number;
  createdAt: string;
}

/** Detalle completo de un proyecto (GET /tenants/:id/projects/:pid). */
export interface ProjectDetail extends Project {
  githubRepoUrl?: string;
  vercelDeploymentUrl?: string;
  threads: Thread[];
}

/** Respuesta de POST /tenants/:tenantId/projects */
export interface CreateProjectResponse {
  projectId: string;
  name: string;
  status: ProjectStatus;
  sourceType: ProjectSource;
  githubRepoUrl?: string;
  vercelDeploymentUrl?: string;
  createdAt: string;
  firstThread: FirstThread;
}

/** DTO para crear un proyecto. */
export interface CreateProjectDto {
  name: string;
  sourceType: ProjectSource;
  /** Obligatorio si sourceType === 'GITHUB_IMPORTED' */
  githubRepoUrl?: string;
  /** Opcional */
  vercelDeploymentUrl?: string;
}
