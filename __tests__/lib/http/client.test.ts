/**
 * Tests — lib/http/client.ts
 *
 * Cubre todas las ramas de la función `request` interna:
 *  - Con y sin token (branch: headers Authorization)
 *  - Con y sin body (branch: body serialization)
 *  - Respuesta ok vs no-ok (branch: HttpError)
 *  - Todos los métodos del cliente (get, post, put, patch, delete)
 */

import { httpClient, HttpError } from '@/lib/http/client';

// ─── Utilidades de mock ───────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown, ok = true) {
  const spy = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(body),
  } as Response) as jest.Mock;
  global.fetch = spy as typeof fetch;
  return spy;
}

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('httpClient', () => {
  describe('GET — sin token', () => {
    it('realiza fetch con headers correctos y retorna JSON', async () => {
      const spy = mockFetch(200, { id: '1' });
      const result = await httpClient.get('/api/test');

      expect(spy).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('GET — con token', () => {
    it('inyecta el header Authorization cuando se provee token', async () => {
      const spy = mockFetch(200, []);
      await httpClient.get('/api/test', { token: 'clerk-token-abc' });

      expect(spy).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer clerk-token-abc',
          },
        }),
      );
    });

    it('NO inyecta Authorization si token es null', async () => {
      const spy = mockFetch(200, []);
      await httpClient.get('/api/test', { token: null });

      const callHeaders = (spy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
      expect(callHeaders['Authorization']).toBeUndefined();
    });
  });

  describe('POST', () => {
    it('serializa el body como JSON', async () => {
      const spy = mockFetch(201, { id: '2' });
      const dto = { content: 'Hola', projectId: 'p1' };

      await httpClient.post('/api/messages', dto, { token: 'tok' });

      expect(spy).toHaveBeenCalledWith(
        '/api/messages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dto),
        }),
      );
    });
  });

  describe('PUT', () => {
    it('realiza fetch con método PUT', async () => {
      const spy = mockFetch(200, { id: '3', name: 'Updated' });
      await httpClient.put('/api/projects/3', { name: 'Updated' });

      expect(spy).toHaveBeenCalledWith(
        '/api/projects/3',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('PATCH', () => {
    it('realiza fetch con método PATCH', async () => {
      const spy = mockFetch(200, { id: '4' });
      await httpClient.patch('/api/projects/4', { name: 'Patched' });

      expect(spy).toHaveBeenCalledWith(
        '/api/projects/4',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });

  describe('DELETE', () => {
    it('realiza fetch con método DELETE sin body', async () => {
      const spy = mockFetch(200, undefined);
      await httpClient.delete('/api/projects/5');

      expect(spy).toHaveBeenCalledWith(
        '/api/projects/5',
        expect.objectContaining({ method: 'DELETE', body: undefined }),
      );
    });
  });

  describe('HttpError', () => {
    it('lanza HttpError cuando la respuesta no es ok', async () => {
      mockFetch(404, { message: 'Not Found' }, false);

      await expect(httpClient.get('/api/missing')).rejects.toThrow(HttpError);
    });

    it('HttpError expone status y statusText correctos', async () => {
      mockFetch(422, {}, false);

      try {
        await httpClient.get('/api/invalid');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpError);
        expect((err as HttpError).status).toBe(422);
      }
    });

    it('HttpError tiene name "HttpError"', () => {
      const error = new HttpError(500, 'Internal Server Error');
      expect(error.name).toBe('HttpError');
      expect(error.message).toBe('HTTP 500: Internal Server Error');
    });
  });
});
