/**
 * Tests — lib/services/messages.service.ts
 *
 * Cubre el 100% de ramas, funciones, líneas y statements.
 * Se mockea fetch globalmente para aislar el servicio de la red.
 */

import {
  postMessage,
  getMessages,
  getMessageById,
} from '@/lib/services/messages.service';
import { HttpError } from '@/lib/http/client';
import type { Message, PostMessageDto } from '@/lib/types/message.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMessage: Message = {
  id: 'msg-001',
  role: 'user',
  content: 'Crea un CRUD de proyectos',
  status: 'pending',
  projectId: 'proj-001',
  createdAt: '2026-03-09T10:00:00Z',
  updatedAt: '2026-03-09T10:00:00Z',
};

const mockMessages: Message[] = [mockMessage];

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockFetchResponse(status: number, body: unknown, ok = true) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: () => Promise.resolve(body),
  } as Response) as typeof fetch;
}

afterEach(() => jest.clearAllMocks());

// ─── postMessage ──────────────────────────────────────────────────────────────

describe('postMessage()', () => {
  const dto: PostMessageDto = {
    content: 'Crea un CRUD de proyectos',
    projectId: 'proj-001',
  };

  it('envía POST /api/messages y retorna el mensaje creado', async () => {
    mockFetchResponse(201, mockMessage);

    const result = await postMessage(dto, { token: 'tok-123' });

    expect(result).toEqual(mockMessage);
    expect(fetch).toHaveBeenCalledWith(
      '/api/messages',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(dto),
        headers: expect.objectContaining({ Authorization: 'Bearer tok-123' }),
      }),
    );
  });

  it('propaga HttpError si el servidor responde 422', async () => {
    mockFetchResponse(422, { error: 'Invalid payload' }, false);

    await expect(postMessage(dto)).rejects.toThrow(HttpError);
  });

  it('puede llamarse sin token (petición sin Authorization)', async () => {
    mockFetchResponse(201, mockMessage);

    const result = await postMessage(dto);
    expect(result).toEqual(mockMessage);
    const callHeaders = (
      (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    ).headers as Record<string, string>;
    expect(callHeaders['Authorization']).toBeUndefined();
  });
});

// ─── getMessages ──────────────────────────────────────────────────────────────

describe('getMessages()', () => {
  it('envía GET /api/messages?projectId=... y retorna array', async () => {
    mockFetchResponse(200, mockMessages);

    const result = await getMessages('proj-001', { token: 'tok-999' });

    expect(result).toEqual(mockMessages);
    expect(fetch).toHaveBeenCalledWith(
      '/api/messages?projectId=proj-001',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propaga HttpError si el servidor responde 401', async () => {
    mockFetchResponse(401, { error: 'Unauthorized' }, false);

    await expect(getMessages('proj-001')).rejects.toThrow(HttpError);
  });

  it('retorna array vacío correctamente', async () => {
    mockFetchResponse(200, []);

    const result = await getMessages('proj-002');
    expect(result).toEqual([]);
  });
});

// ─── getMessageById ───────────────────────────────────────────────────────────

describe('getMessageById()', () => {
  it('envía GET /api/messages/:id y retorna el mensaje', async () => {
    mockFetchResponse(200, mockMessage);

    const result = await getMessageById('msg-001', { token: 'tok-abc' });

    expect(result).toEqual(mockMessage);
    expect(fetch).toHaveBeenCalledWith(
      '/api/messages/msg-001',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propaga HttpError si el mensaje no existe (404)', async () => {
    mockFetchResponse(404, { error: 'Not found' }, false);

    await expect(getMessageById('msg-xyz')).rejects.toThrow(HttpError);
  });
});
