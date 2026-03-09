/**
 * Agents Service — lib/services/agents.service.ts
 *
 * SRP: gestiona exclusivamente las operaciones del recurso /agents.
 * DIP: depende de httpClient (abstracción).
 */

import { httpClient, HttpClientOptions } from '@/lib/http/client';
import type {
  Agent,
  CreateAgentDto,
  UpdateAgentDto,
} from '@/lib/types/agent.types';

const BASE_PATH = '/api/agents';

/** Lista todos los agentes IA disponibles. */
export async function getAgents(options?: HttpClientOptions): Promise<Agent[]> {
  return httpClient.get<Agent[]>(BASE_PATH, options);
}

/** Obtiene un agente por ID. */
export async function getAgentById(
  id: string,
  options?: HttpClientOptions,
): Promise<Agent> {
  return httpClient.get<Agent>(`${BASE_PATH}/${id}`, options);
}

/** Crea un nuevo agente. */
export async function createAgent(
  dto: CreateAgentDto,
  options?: HttpClientOptions,
): Promise<Agent> {
  return httpClient.post<Agent>(BASE_PATH, dto, options);
}

/** Actualiza parcialmente un agente. */
export async function updateAgent(
  id: string,
  dto: UpdateAgentDto,
  options?: HttpClientOptions,
): Promise<Agent> {
  return httpClient.patch<Agent>(`${BASE_PATH}/${id}`, dto, options);
}

/** Elimina un agente por ID. */
export async function deleteAgent(
  id: string,
  options?: HttpClientOptions,
): Promise<void> {
  return httpClient.delete<void>(`${BASE_PATH}/${id}`, options);
}
