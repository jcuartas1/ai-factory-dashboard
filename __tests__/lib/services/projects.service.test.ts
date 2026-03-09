/**
 * Tests — lib/services/projects.service.ts
 */

import {
  getProjects,
  getProjectById,
  createProject,
} from '@/lib/services/projects.service';
import { HttpError } from '@/lib/http/client';
import type {
  Project,
  ProjectDetail,
  CreateProjectDto,
  CreateProjectResponse,
} from '@/lib/types/project.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TENANT_ID = 'tenant-abc';
const PROJECT_ID = 'proj-001';

const mockProject: Project = {
  projectId: PROJECT_ID,
  name: 'Portal de Clientes',
  status: 'DRAFT',
  sourceType: 'NEW_GENERATED',
  threadCount: 1,
  createdAt: '2026-03-09T10:00:00Z',
};

const mockProjectDetail: ProjectDetail = {
  ...mockProject,
  threads: [
    {
      threadId: 'thread-001',
      title: 'Hilo inicial',
      status: 'OPEN',
      createdAt: '2026-03-09T10:00:00Z',
    },
  ],
};

const mockCreateResponse: CreateProjectResponse = {
  projectId: PROJECT_ID,
  name: 'Portal de Clientes',
  status: 'DRAFT',
  sourceType: 'NEW_GENERATED',
  createdAt: '2026-03-09T10:00:00Z',
  firstThread: {
    threadId: 'thread-001',
    title: 'Hilo inicial',
    status: 'OPEN',
  },
};

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockFetchResponse(status: number, body: unknown, ok = true) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  } as Response) as typeof fetch;
}

afterEach(() => jest.clearAllMocks());

// ─── getProjects ──────────────────────────────────────────────────────────────

describe('getProjects()', () => {
  it('envía GET /tenants/:tenantId/projects y retorna el array de proyectos', async () => {
    mockFetchResponse(200, { tenantId: TENANT_ID, projects: [mockProject] });

    const result = await getProjects(TENANT_ID, { token: 'tok' });

    expect(result).toEqual([mockProject]);
    expect(fetch).toHaveBeenCalledWith(
      `/tenants/${TENANT_ID}/projects`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('retorna array vacío si el tenant no tiene proyectos', async () => {
    mockFetchResponse(200, { tenantId: TENANT_ID, projects: [] });
    const result = await getProjects(TENANT_ID);
    expect(result).toEqual([]);
  });

  it('propaga HttpError en error de servidor (500)', async () => {
    mockFetchResponse(500, {}, false);
    await expect(getProjects(TENANT_ID)).rejects.toThrow(HttpError);
  });
});

// ─── getProjectById ───────────────────────────────────────────────────────────

describe('getProjectById()', () => {
  it('envía GET /tenants/:tenantId/projects/:projectId y retorna el detalle', async () => {
    mockFetchResponse(200, mockProjectDetail);

    const result = await getProjectById(TENANT_ID, PROJECT_ID, { token: 'tok' });

    expect(result).toEqual(mockProjectDetail);
    expect(fetch).toHaveBeenCalledWith(
      `/tenants/${TENANT_ID}/projects/${PROJECT_ID}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propaga HttpError si el proyecto no existe (404)', async () => {
    mockFetchResponse(404, {}, false);
    await expect(getProjectById(TENANT_ID, 'nope')).rejects.toThrow(HttpError);
  });

  it('propaga HttpError si el usuario no es miembro del tenant (403)', async () => {
    mockFetchResponse(403, {}, false);
    await expect(getProjectById(TENANT_ID, PROJECT_ID)).rejects.toThrow(HttpError);
  });
});

// ─── createProject ────────────────────────────────────────────────────────────

describe('createProject()', () => {
  const dto: CreateProjectDto = {
    name: 'Portal de Clientes',
    sourceType: 'NEW_GENERATED',
  };

  it('envía POST /tenants/:tenantId/projects con DTO y retorna respuesta con firstThread', async () => {
    mockFetchResponse(201, mockCreateResponse);

    const result = await createProject(TENANT_ID, dto, { token: 'tok' });

    expect(result.projectId).toBe(PROJECT_ID);
    expect(result.firstThread.threadId).toBe('thread-001');
    expect(result.status).toBe('DRAFT');
    expect(fetch).toHaveBeenCalledWith(
      `/tenants/${TENANT_ID}/projects`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    );
  });

  it('envía githubRepoUrl cuando sourceType es GITHUB_IMPORTED', async () => {
    const githubDto: CreateProjectDto = {
      name: 'API E-commerce',
      sourceType: 'GITHUB_IMPORTED',
      githubRepoUrl: 'https://github.com/org/repo',
    };
    mockFetchResponse(201, { ...mockCreateResponse, ...githubDto });

    await createProject(TENANT_ID, githubDto, { token: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      `/tenants/${TENANT_ID}/projects`,
      expect.objectContaining({
        body: JSON.stringify(githubDto),
      }),
    );
  });

  it('propaga HttpError en datos inválidos (400)', async () => {
    mockFetchResponse(400, {}, false);
    await expect(createProject(TENANT_ID, dto)).rejects.toThrow(HttpError);
  });

  it('propaga HttpError si el rol no permite crear proyectos (403)', async () => {
    mockFetchResponse(403, {}, false);
    await expect(createProject(TENANT_ID, dto)).rejects.toThrow(HttpError);
  });
});
