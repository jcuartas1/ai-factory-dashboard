## TICKET-FE-TD-001: Capa de Servicios e Infraestructura — `lib/services/` y `lib/types/`

**Tipo:** Deuda Técnica — Arquitectura  
**Prioridad:** 🔴 Alta  
**Detectado en:** Auditoría post TICKET-FE-003  
**Rama sugerida:** `refactor/ticket-fe-td-001-lib-layer`

---

## Contexto

Actualmente `lib/` solo contiene `utils.ts` con la función `cn()`. No existe ninguna capa de abstracción para la comunicación con la API ni para los tipos de dominio del negocio.

El próximo ticket de chat/mensajería (polling con SWR) requerirá llamadas a `POST /messages` y `GET /messages/:id`. Sin esta capa, esa lógica quedará inline en los componentes, violando **Single Responsibility** y **Dependency Inversion** de SOLID.

## Problema actual

```
lib/
  utils.ts   ← solo cn(). Sin servicios, sin tipos, sin repositorios.
```

## Estructura objetivo

```
lib/
  utils.ts                    ← (existente)
  services/
    messages.service.ts       ← POST /messages, GET /messages
    projects.service.ts       ← CRUD proyectos
    agents.service.ts         ← CRUD agentes
  repositories/
    messages.repository.ts    ← abstracción sobre fetch/SWR
  types/
    message.types.ts          ← Message, MessageStatus, MessageRole
    project.types.ts          ← Project, ProjectStatus
    agent.types.ts            ← Agent, AgentType
  http/
    client.ts                 ← fetch wrapper base con headers/auth
```

## Tareas

- [ ] Crear `lib/http/client.ts` — wrapper de `fetch` que inyecta `Authorization` desde Clerk
- [ ] Crear `lib/types/message.types.ts`, `project.types.ts`, `agent.types.ts`
- [ ] Crear `lib/services/messages.service.ts` con `postMessage()` y `getMessages()`
- [ ] Crear `lib/services/projects.service.ts`
- [ ] Crear `lib/services/agents.service.ts`
- [ ] Tests unitarios para cada servicio (mocking fetch)
- [ ] Mantener 100% de cobertura en `lib/services/**`

## Criterios de Aceptación

- [ ] Ningún componente hace `fetch()` directamente — toda llamada a la API pasa por un servicio
- [ ] Los tipos de dominio están centralizados en `lib/types/`
- [ ] `pnpm test --coverage` mantiene 100% en el dominio propio
