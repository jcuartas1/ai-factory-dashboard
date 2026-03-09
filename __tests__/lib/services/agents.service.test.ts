/**
 * Tests — lib/services/agents.service.ts
 */

import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
} from '@/lib/services/agents.service';
import { HttpError } from '@/lib/http/client';
import type { Agent, CreateAgentDto, UpdateAgentDto } from '@/lib/types/agent.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAgent: Agent = {
  id: 'agent-001',
  name: 'Dev Agent Alpha',
  type: 'developer',
  status: 'idle',
  description: 'Agente especializado en Next.js',
  capabilities: ['typescript', 'react', 'nextjs'],
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

// ─── getAgents ────────────────────────────────────────────────────────────────

describe('getAgents()', () => {
  it('envía GET /api/agents y retorna array de agentes', async () => {
    mockFetchResponse(200, [mockAgent]);

    const result = await getAgents({ token: 'tok' });

    expect(result).toEqual([mockAgent]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/agents',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('retorna array vacío si no hay agentes', async () => {
    mockFetchResponse(200, []);
    const result = await getAgents();
    expect(result).toEqual([]);
  });

  it('propaga HttpError en error de servidor', async () => {
    mockFetchResponse(500, {}, false);
    await expect(getAgents()).rejects.toThrow(HttpError);
  });
});

// ─── getAgentById ─────────────────────────────────────────────────────────────

describe('getAgentById()', () => {
  it('envía GET /api/agents/:id y retorna el agente', async () => {
    mockFetchResponse(200, mockAgent);

    const result = await getAgentById('agent-001', { token: 'tok' });

    expect(result).toEqual(mockAgent);
    expect(fetch).toHaveBeenCalledWith(
      '/api/agents/agent-001',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propaga HttpError si el agente no existe (404)', async () => {
    mockFetchResponse(404, {}, false);
    await expect(getAgentById('nope')).rejects.toThrow(HttpError);
  });
});

// ─── createAgent ──────────────────────────────────────────────────────────────

describe('createAgent()', () => {
  const dto: CreateAgentDto = {
    name: 'QA Bot',
    type: 'qa',
    description: 'Agente de testing',
    capabilities: ['jest', 'playwright'],
  };

  it('envía POST /api/agents y retorna el agente creado', async () => {
    mockFetchResponse(201, { ...mockAgent, ...dto });

    const result = await createAgent(dto, { token: 'tok' });

    expect(result.name).toBe(dto.name);
    expect(fetch).toHaveBeenCalledWith(
      '/api/agents',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    );
  });

  it('propaga HttpError en datos inválidos (422)', async () => {
    mockFetchResponse(422, {}, false);
    await expect(createAgent(dto)).rejects.toThrow(HttpError);
  });
});

// ─── updateAgent ──────────────────────────────────────────────────────────────

describe('updateAgent()', () => {
  const dto: UpdateAgentDto = { status: 'busy' };

  it('envía PATCH /api/agents/:id y retorna el agente actualizado', async () => {
    mockFetchResponse(200, { ...mockAgent, ...dto });

    const result = await updateAgent('agent-001', dto, { token: 'tok' });

    expect(result.status).toBe('busy');
    expect(fetch).toHaveBeenCalledWith(
      '/api/agents/agent-001',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('propaga HttpError en error de autorización', async () => {
    mockFetchResponse(403, {}, false);
    await expect(updateAgent('agent-001', dto)).rejects.toThrow(HttpError);
  });
});

// ─── deleteAgent ──────────────────────────────────────────────────────────────

describe('deleteAgent()', () => {
  it('envía DELETE /api/agents/:id', async () => {
    mockFetchResponse(204, undefined);

    await deleteAgent('agent-001', { token: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/agents/agent-001',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('propaga HttpError si el agente no existe', async () => {
    mockFetchResponse(404, {}, false);
    await expect(deleteAgent('nope')).rejects.toThrow(HttpError);
  });
});
