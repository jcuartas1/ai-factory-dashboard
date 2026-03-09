/**
 * Tests — lib/services/projects.service.ts
 */

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/services/projects.service';
import { HttpError } from '@/lib/http/client';
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/lib/types/project.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProject: Project = {
  id: 'proj-001',
  name: 'E-Commerce Platform',
  description: 'Plataforma generada con IA',
  status: 'deployed',
  deployUrl: 'https://my-app.vercel.app',
  createdAt: '2026-03-09T10:00:00Z',
  updatedAt: '2026-03-09T10:00:00Z',
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
  it('envía GET /api/projects y retorna array de proyectos', async () => {
    mockFetchResponse(200, [mockProject]);

    const result = await getProjects({ token: 'tok' });

    expect(result).toEqual([mockProject]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('retorna array vacío si no hay proyectos', async () => {
    mockFetchResponse(200, []);
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('propaga HttpError en error de servidor', async () => {
    mockFetchResponse(500, {}, false);
    await expect(getProjects()).rejects.toThrow(HttpError);
  });
});

// ─── getProjectById ───────────────────────────────────────────────────────────

describe('getProjectById()', () => {
  it('envía GET /api/projects/:id y retorna el proyecto', async () => {
    mockFetchResponse(200, mockProject);

    const result = await getProjectById('proj-001', { token: 'tok' });

    expect(result).toEqual(mockProject);
    expect(fetch).toHaveBeenCalledWith(
      '/api/projects/proj-001',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propaga HttpError si el proyecto no existe (404)', async () => {
    mockFetchResponse(404, {}, false);
    await expect(getProjectById('nope')).rejects.toThrow(HttpError);
  });
});

// ─── createProject ────────────────────────────────────────────────────────────

describe('createProject()', () => {
  const dto: CreateProjectDto = {
    name: 'New App',
    description: 'Descripción',
  };

  it('envía POST /api/projects con el DTO y retorna el proyecto creado', async () => {
    mockFetchResponse(201, { ...mockProject, ...dto });

    const result = await createProject(dto, { token: 'tok' });

    expect(result.name).toBe(dto.name);
    expect(fetch).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    );
  });

  it('propaga HttpError en datos inválidos (422)', async () => {
    mockFetchResponse(422, {}, false);
    await expect(createProject(dto)).rejects.toThrow(HttpError);
  });
});

// ─── updateProject ────────────────────────────────────────────────────────────

describe('updateProject()', () => {
  const dto: UpdateProjectDto = { name: 'Renamed App' };

  it('envía PATCH /api/projects/:id y retorna el proyecto actualizado', async () => {
    mockFetchResponse(200, { ...mockProject, ...dto });

    const result = await updateProject('proj-001', dto, { token: 'tok' });

    expect(result.name).toBe('Renamed App');
    expect(fetch).toHaveBeenCalledWith(
      '/api/projects/proj-001',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('propaga HttpError en error de autorización (403)', async () => {
    mockFetchResponse(403, {}, false);
    await expect(updateProject('proj-001', dto)).rejects.toThrow(HttpError);
  });
});

// ─── deleteProject ────────────────────────────────────────────────────────────

describe('deleteProject()', () => {
  it('envía DELETE /api/projects/:id', async () => {
    mockFetchResponse(204, undefined);

    await deleteProject('proj-001', { token: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/projects/proj-001',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('propaga HttpError si el proyecto no existe', async () => {
    mockFetchResponse(404, {}, false);
    await expect(deleteProject('nope')).rejects.toThrow(HttpError);
  });
});
