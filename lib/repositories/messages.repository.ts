'use client';

/**
 * Messages Repository — lib/repositories/messages.repository.ts
 *
 * Capa de abstracción sobre SWR para el recurso /messages.
 *
 * SRP: encapsula el polling/caching con SWR. Los componentes no necesitan
 *      conocer los detalles de SWR ni de los endpoints.
 * DIP: importa los servicios (abstracción), no hace fetch directamente.
 * OCP: se puede extender añadiendo hooks sin modificar los existentes.
 *
 * Flujo asíncrono (crítico):
 *   POST /messages → 201 inmediato (via service).
 *   El agente procesa en background. El hook useMessageById hace polling
 *   cada POLLING_INTERVAL ms hasta que status === 'completed' | 'failed'.
 */

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { getMessages, getMessageById } from '@/lib/services/messages.service';
import type { Message } from '@/lib/types/message.types';

/** Intervalo de polling en ms para respuestas de IA asíncronas. */
const POLLING_INTERVAL = 3_000;

// ─── Fetchers puros (sin hooks — reutilizables y testeables) ─────────────────

/** Fetcher para obtener todos los mensajes de un proyecto. */
export const fetchMessages = (
  projectId: string,
  token: string | null,
): Promise<Message[]> => getMessages(projectId, { token });

/** Fetcher para obtener un mensaje por ID (usado en polling). */
export const fetchMessageById = (
  id: string,
  token: string | null,
): Promise<Message> => getMessageById(id, { token });

// ─── SWR Hooks ────────────────────────────────────────────────────────────────

/**
 * Hook para listar mensajes de un proyecto con revalidación automática.
 * @param projectId - ID del proyecto. Si es null, el hook queda en standby.
 * @param token     - Bearer token de Clerk.
 * @param config    - Configuración SWR adicional (opcional).
 */
export function useMessages(
  projectId: string | null,
  token: string | null,
  config?: SWRConfiguration<Message[]>,
) {
  return useSWR<Message[]>(
    projectId ? ['messages', projectId] : null,
    ([, id]) => getMessages(id as string, { token }),
    {
      refreshInterval: POLLING_INTERVAL,
      ...config,
    },
  );
}

/**
 * Hook para observar el estado de un mensaje específico con polling.
 * Diseñado para detectar cuándo el agente finaliza la respuesta asíncrona.
 * @param id     - ID del mensaje. Si es null, el hook queda en standby.
 * @param token  - Bearer token de Clerk.
 * @param config - Configuración SWR adicional (para desactivar polling cuando status === 'completed').
 */
export function useMessageById(
  id: string | null,
  token: string | null,
  config?: SWRConfiguration<Message>,
) {
  return useSWR<Message>(
    id ? ['message', id] : null,
    ([, messageId]) => getMessageById(messageId as string, { token }),
    {
      refreshInterval: (data) =>
        data?.status === 'completed' || data?.status === 'failed'
          ? 0 // Detiene el polling cuando la IA terminó
          : POLLING_INTERVAL,
      ...config,
    },
  );
}
