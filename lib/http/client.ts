/**
 * HTTP Client — lib/http/client.ts
 *
 * Principios SOLID aplicados:
 * - SRP: única responsabilidad — gestionar requests HTTP con headers de autenticación.
 * - OCP: extensible via HttpClientOptions sin modificar la firma base.
 * - DIP: el token se inyecta desde afuera; este módulo NO obtiene el token por sí mismo.
 *         El caller (RSC con auth() o hook con useAuth()) es responsable de proveerlo.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Error personalizado (testeable con instanceof) ──────────────────────────

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

// ─── Contrato de opciones ─────────────────────────────────────────────────────

export interface HttpClientOptions {
  /** Bearer token de Clerk. Se inyecta desde el caller. */
  token?: string | null;
  /** AbortSignal para cancelar requests en flight. */
  signal?: AbortSignal;
}

// ─── Request interno ──────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  options?: HttpClientOptions & { body?: unknown },
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

// ─── Cliente público ──────────────────────────────────────────────────────────

export const httpClient = {
  get: <T>(path: string, options?: HttpClientOptions): Promise<T> =>
    request<T>('GET', path, options),

  post: <T>(path: string, body: unknown, options?: HttpClientOptions): Promise<T> =>
    request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body: unknown, options?: HttpClientOptions): Promise<T> =>
    request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body: unknown, options?: HttpClientOptions): Promise<T> =>
    request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, options?: HttpClientOptions): Promise<T> =>
    request<T>('DELETE', path, options),
};
