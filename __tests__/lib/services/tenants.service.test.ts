/**
 * Tests — lib/services/tenants.service.ts
 */

import {
  createTenant,
  getMyTenants,
  updateTenant,
} from '@/lib/services/tenants.service';
import { HttpError } from '@/lib/http/client';
import type {
  Tenant,
  UserTenantMembership,
  CreateTenantDto,
  UpdateTenantDto,
} from '@/lib/types/tenant.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const mockTenant: Tenant = {
  id: TENANT_ID,
  name: 'Mi Empresa SAS',
  status: 'PENDING_PAYMENT',
  createdAt: '2026-03-09T10:00:00.000Z',
};

const mockMembership: UserTenantMembership = {
  tenantId: TENANT_ID,
  tenantName: 'Mi Empresa SAS',
  tenantStatus: 'ACTIVE',
  role: 'ADMIN',
  joinedAt: '2026-03-09T10:00:00.000Z',
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

// ─── createTenant ─────────────────────────────────────────────────────────────

describe('createTenant()', () => {
  const dto: CreateTenantDto = { name: 'Mi Empresa SAS' };

  it('envía POST /tenants con el DTO y retorna el tenant creado', async () => {
    mockFetchResponse(201, mockTenant);

    const result = await createTenant(dto, { token: 'tok' });

    expect(result).toEqual(mockTenant);
    expect(result.status).toBe('PENDING_PAYMENT');
    expect(fetch).toHaveBeenCalledWith(
      '/tenants',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    );
  });

  it('incluye el header Authorization con el token', async () => {
    mockFetchResponse(201, mockTenant);

    await createTenant(dto, { token: 'my-jwt' });

    expect(fetch).toHaveBeenCalledWith(
      '/tenants',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-jwt',
        }),
      }),
    );
  });

  it('propaga HttpError si el nombre está vacío (400)', async () => {
    mockFetchResponse(400, {}, false);
    await expect(createTenant({ name: '' })).rejects.toThrow(HttpError);
  });

  it('propaga HttpError si el usuario no tiene rol suficiente (403)', async () => {
    mockFetchResponse(403, {}, false);
    await expect(createTenant(dto)).rejects.toThrow(HttpError);
  });
});

// ─── getMyTenants ─────────────────────────────────────────────────────────────

describe('getMyTenants()', () => {
  it('envía GET /tenants/me y retorna la lista de membresías', async () => {
    mockFetchResponse(200, [mockMembership]);

    const result = await getMyTenants({ token: 'tok' });

    expect(result).toEqual([mockMembership]);
    expect(fetch).toHaveBeenCalledWith(
      '/tenants/me',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('retorna array vacío si el usuario no pertenece a ningún tenant', async () => {
    mockFetchResponse(200, []);
    const result = await getMyTenants({ token: 'tok' });
    expect(result).toEqual([]);
  });

  it('propaga HttpError si el token es inválido (401)', async () => {
    mockFetchResponse(401, {}, false);
    await expect(getMyTenants()).rejects.toThrow(HttpError);
  });
});

// ─── updateTenant ─────────────────────────────────────────────────────────────

describe('updateTenant()', () => {
  const dto: UpdateTenantDto = { name: 'Mi Empresa SAS Actualizada' };

  it('envía PATCH /tenants/:id con el DTO y retorna el tenant actualizado', async () => {
    const updated: Tenant = { ...mockTenant, name: dto.name };
    mockFetchResponse(200, updated);

    const result = await updateTenant(TENANT_ID, dto, { token: 'tok' });

    expect(result.name).toBe(dto.name);
    expect(fetch).toHaveBeenCalledWith(
      `/tenants/${TENANT_ID}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    );
  });

  it('propaga HttpError si el rol es ANALYST (403)', async () => {
    mockFetchResponse(403, {}, false);
    await expect(updateTenant(TENANT_ID, dto)).rejects.toThrow(HttpError);
  });

  it('propaga HttpError si el tenant no existe (404)', async () => {
    mockFetchResponse(404, {}, false);
    await expect(updateTenant('nope', dto)).rejects.toThrow(HttpError);
  });
});
