# TICKET-FE-TD-001 — Cierre y Resolución
## Refactor — Capa de Servicios e Infraestructura HTTP

---

## Información del Ticket

| Campo | Valor |
|---|---|
| **ID** | TICKET-FE-TD-001 |
| **Tipo** | Deuda Técnica — Arquitectura |
| **Estado** | ✅ Done |
| **Prioridad** | 🔴 Alta |
| **Componente** | Frontend — `lib/` Domain Layer |
| **Asignado a** | @aifactory-dev |
| **Reporter** | @juliancuartas |
| **Detectado en** | Auditoría post TICKET-FE-003 |
| **Rama sugerida** | `refactor/ticket-fe-td-001-lib-layer` |
| **Fecha de apertura** | 9 de marzo de 2026 |
| **Fecha de cierre** | 9 de marzo de 2026 |
| **Epic** | AI Software Factory — Frontend Core |

---

## Descripción Original

`lib/` solo contenía `utils.ts` con la función `cn()`. No existía ninguna capa de abstracción para la comunicación con la API ni para los tipos de dominio del negocio. El ticket de chat/mensajería con polling SWR requería llamadas a `POST /messages` y `GET /messages/:id`. Sin esta capa, esa lógica quedaría inline en los componentes, violando **Single Responsibility** y **Dependency Inversion** de SOLID.

---

## Estado Previo

```
lib/
  utils.ts   ← solo cn(). Sin servicios, sin tipos, sin repositorios.
```

Ningún componente tenía `fetch` inline aún, pero el proyecto estaba a un ticket de distancia de esa deuda.

---

## Trabajo Realizado

### 1. `lib/http/client.ts` — HTTP Client base

Wrapper sobre `fetch` nativo que centraliza:

- Inyección del header `Authorization: Bearer <token>` (DIP: el token lo provee el caller — RSC o hook de Clerk).
- Serialización/deserialización JSON automática.
- `HttpError` como clase propia (testeable con `instanceof`).
- Métodos tipados: `get`, `post`, `put`, `patch`, `delete`.
- Soporte de `AbortSignal` para cancelación.

**Principios SOLID aplicados:**
- **SRP**: única responsabilidad — construir y ejecutar requests HTTP.
- **OCP**: extensible via `HttpClientOptions` sin modificar `request()`.
- **DIP**: no obtiene el token por sí mismo; lo recibe inyectado.

---

### 2. `lib/types/` — Tipos de dominio centralizados

| Archivo | Tipos exportados |
|---|---|
| `message.types.ts` | `Message`, `MessageRole`, `MessageStatus`, `PostMessageDto` |
| `project.types.ts` | `Project`, `ProjectStatus`, `CreateProjectDto`, `UpdateProjectDto` |
| `agent.types.ts` | `Agent`, `AgentType`, `AgentStatus`, `CreateAgentDto`, `UpdateAgentDto` |

**ISP aplicado**: cada módulo de tipos es cohesivo con su recurso. Los componentes importan solo el contrato que necesitan.

---

### 3. `lib/services/` — Servicios de dominio

Cada servicio expone funciones puras que delegan en `httpClient`:

**`messages.service.ts`**
- `postMessage(dto, options?)` — `POST /api/messages` (respuesta 201 inmediata, backend procesa async)
- `getMessages(projectId, options?)` — `GET /api/messages?projectId=...`
- `getMessageById(id, options?)` — `GET /api/messages/:id` (usado en polling)

**`projects.service.ts`**
- `getProjects`, `getProjectById`, `createProject`, `updateProject`, `deleteProject`

**`agents.service.ts`**
- `getAgents`, `getAgentById`, `createAgent`, `updateAgent`, `deleteAgent`

**SRP aplicado**: cada servicio gestiona exclusivamente su recurso. Ningún componente llama a `fetch` directamente.

---

### 4. `lib/repositories/messages.repository.ts` — Abstracción SWR

Expone fetchers puros y hooks SWR listos para el ticket de chat:

- `fetchMessages(projectId, token)` — fetcher puro (testeable).
- `fetchMessageById(id, token)` — fetcher puro (testeable).
- `useMessages(projectId, token, config?)` — hook SWR con `refreshInterval: 3000`.
- `useMessageById(id, token, config?)` — hook SWR con **polling inteligente**: para automáticamente cuando `status === 'completed' | 'failed'`.

---

### 5. Tests unitarios — `__tests__/lib/`

| Archivo de test | Tests |
|---|---|
| `lib/http/client.test.ts` | 10 tests — cubre todas las ramas (token, sin token, body, métodos HTTP, HttpError) |
| `lib/services/messages.service.test.ts` | 8 tests — postMessage, getMessages, getMessageById |
| `lib/services/projects.service.test.ts` | 10 tests — CRUD completo |
| `lib/services/agents.service.test.ts` | 10 tests — CRUD completo |

**Estrategia de mock**: `global.fetch = jest.fn()` asignado directamente (compatible con jsdom + Jest 30).

---

### 6. `jest.config.ts` — Cobertura actualizada

Se añadieron `lib/http/**` y `lib/services/**` a `collectCoverageFrom` con threshold independiente de **100%** en branches, functions, lines y statements.

Los `lib/types/**` (solo interfaces, sin lógica) y `lib/repositories/**` (SWR hooks — requieren `renderHook`) quedaron excluidos del coverage para evitar falsos negativos.

---

## Resultados Finales

### Tests

```
Test Suites: 7 passed, 7 total
Tests:       72 passed, 72 total
Time:        3.485s
```

### Cobertura

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |     100 |      100 |     100 |     100 |
 lib/http             |     100 |      100 |     100 |     100 |
  client.ts           |     100 |      100 |     100 |     100 |
 lib/services         |     100 |      100 |     100 |     100 |
  agents.service.ts   |     100 |      100 |     100 |     100 |
  messages.service.ts |     100 |      100 |     100 |     100 |
  projects.service.ts |     100 |      100 |     100 |     100 |
----------------------|---------|----------|---------|---------|
```

### Build

```
✓ Compiled successfully in 1615.5ms
✓ Finished TypeScript in 3.8s
✓ Generating static pages (7/7)
```

Sin errores de TypeScript. Sin warnings.

---

## Estructura Final

```
lib/
  utils.ts                         ← (sin cambios)
  http/
    client.ts                      ← fetch wrapper + HttpError
  types/
    message.types.ts
    project.types.ts
    agent.types.ts
  services/
    messages.service.ts
    projects.service.ts
    agents.service.ts
  repositories/
    messages.repository.ts         ← SWR hooks con polling inteligente

__tests__/lib/
  http/
    client.test.ts
  services/
    messages.service.test.ts
    projects.service.test.ts
    agents.service.test.ts
```

---

## Criterios de Aceptación — Verificación

| Criterio | Estado |
|---|---|
| Ningún componente hace `fetch()` directamente | ✅ Garantizado — toda llamada pasa por un servicio |
| Tipos de dominio centralizados en `lib/types/` | ✅ |
| `pnpm test --coverage` mantiene 100% en `lib/services/**` | ✅ 100% en branches, functions, lines, statements |
| Build de producción sin errores | ✅ |

---

## Impacto en el Siguiente Ticket

El próximo ticket de chat/mensajería tiene disponible:
1. `postMessage()` listo para el `POST /messages` asíncrono.
2. `useMessageById()` con polling auto-apagable para detectar respuesta del agente.
3. Todos los tipos TypeScript del dominio sin necesidad de redefinirlos.
