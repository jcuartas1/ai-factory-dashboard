# hooks/domain/

Hooks de lógica de negocio que consumen la capa de servicios (`lib/services/`) via SWR.

## Convención

| Regla | Descripción |
|---|---|
| **Naming** | `use-<recurso>.ts` — kebab-case, singular |
| **Dependencias** | Importar exclusivamente desde `lib/services/` o `lib/repositories/` |
| **Estado** | Sin `useState` para datos remotos — siempre SWR |
| **Token** | Obtener via `useAuth()` de Clerk e inyectar en el servicio |
| **`"use client"`** | Obligatorio — todos los hooks de dominio son Client Components |

## Hooks planificados

| Hook | Ticket | Descripción |
|---|---|---|
| `use-messages.ts` | TICKET-FE-XXX | Polling de mensajes IA con SWR |
| `use-projects.ts` | TICKET-FE-XXX | CRUD de proyectos con SWR |
| `use-agents.ts` | TICKET-FE-XXX | Estado de agentes IA con SWR |

## Ejemplo de estructura

```typescript
'use client';

import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';
import { getProjects } from '@/lib/services/projects.service';
import type { Project } from '@/lib/types/project.types';

export function useProjects() {
  const { getToken } = useAuth();

  return useSWR<Project[]>('projects', async () => {
    const token = await getToken();
    return getProjects({ token });
  });
}
```
