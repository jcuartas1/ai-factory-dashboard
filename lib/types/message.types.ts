/**
 * Tipos de dominio para Mensajes — lib/types/message.types.ts
 *
 * Centraliza toda la representación de datos del recurso /messages.
 * Nunca importar tipos de dominio desde servicios o componentes directamente;
 * siempre desde este módulo (ISP aplicado).
 */

/**
 * Roles posibles en un mensaje.
 * ⚠️  El cliente NUNCA envía 'role' al backend — el servidor lo asigna.
 *     Solo se usa para renderizado en el chat.
 */
export type MessageRole =
  | 'USER'
  | 'UX_AGENT'
  | 'FULLSTACK_AGENT'
  | 'DEVSEC_AGENT'
  | 'ARCHITECT_AGENT'
  | 'SYSTEM';

export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Entidad Message tal como la devuelve la API. */
export interface Message {
  messageId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

/**
 * DTO para enviar un mensaje.
 * Solo se envía 'content' — el backend rechaza cualquier otra propiedad extra.
 */
export interface PostMessageDto {
  content: string;
}

/** Respuesta inmediata del POST (201) — el agente procesa en background. */
export interface PostMessageResponse {
  messageId: string;
  role: 'USER';
  content: string;
  status: 'pending';
  createdAt: string;
}

/** Respuesta del GET .../messages */
export interface MessagesResponse {
  threadId: string;
  messages: Message[];
}
