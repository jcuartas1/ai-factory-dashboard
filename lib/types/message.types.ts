/**
 * Tipos de dominio para Mensajes — lib/types/message.types.ts
 *
 * Centraliza toda la representación de datos del recurso /messages.
 * Nunca importar tipos de dominio desde servicios o componentes directamente;
 * siempre desde este módulo (ISP aplicado).
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Entidad Message tal como la devuelve la API. */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

/** DTO para crear un nuevo mensaje (POST /messages). */
export interface PostMessageDto {
  content: string;
  projectId: string;
  role?: MessageRole;
}
