/**
 * Tipos de dominio para Agentes IA — lib/types/agent.types.ts
 */

export type AgentType =
  | 'architect'
  | 'developer'
  | 'designer'
  | 'qa'
  | 'devops';

export type AgentStatus = 'idle' | 'busy' | 'offline';

/** Entidad Agent tal como la devuelve la API. */
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
}

/** DTO para crear un agente (POST /agents). */
export interface CreateAgentDto {
  name: string;
  type: AgentType;
  description: string;
  capabilities?: string[];
}

/** DTO para actualizar un agente (PATCH /agents/:id). */
export interface UpdateAgentDto {
  name?: string;
  status?: AgentStatus;
  description?: string;
  capabilities?: string[];
}
