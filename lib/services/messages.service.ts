/**
 * Messages Service — lib/services/messages.service.ts
 *
 * SRP: gestiona exclusivamente las operaciones del recurso /messages.
 * DIP: depende de httpClient (abstracción), no de fetch directamente.
 *
 * Flujo asíncrono (crítico):
 *   POST /messages → 201 inmediato, backend procesa en background.
 *   GET  /messages/:id → polling desde el cliente vía SWR (ver repository).
 */

import { httpClient, HttpClientOptions } from '@/lib/http/client';
import type { Message, PostMessageDto } from '@/lib/types/message.types';

const BASE_PATH = '/api/messages';

/**
 * Envía un mensaje al agente IA.
 * El servidor responde 201 al instante; la respuesta del agente se obtiene via polling.
 */
export async function postMessage(
  dto: PostMessageDto,
  options?: HttpClientOptions,
): Promise<Message> {
  return httpClient.post<Message>(BASE_PATH, dto, options);
}

/**
 * Obtiene todos los mensajes de un proyecto.
 * Se usa como fetcher en el SWR hook del repository.
 */
export async function getMessages(
  projectId: string,
  options?: HttpClientOptions,
): Promise<Message[]> {
  return httpClient.get<Message[]>(`${BASE_PATH}?projectId=${projectId}`, options);
}

/**
 * Obtiene un mensaje por ID.
 * Usado para polling del estado de procesamiento de IA.
 */
export async function getMessageById(
  id: string,
  options?: HttpClientOptions,
): Promise<Message> {
  return httpClient.get<Message>(`${BASE_PATH}/${id}`, options);
}
