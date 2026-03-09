# TICKET-FE-007 — Cierre y Resolución
## Módulo Tenants, Onboarding y Corrección de Dominio

---

## Información del Ticket

| Campo | Valor |
|---|---|
| **ID** | TICKET-FE-007 |
| **Tipo** | Feature — Integración Backend |
| **Estado** | ✅ Done |
| **Prioridad** | 🔴 Alta |
| **Componente** | Frontend — `lib/` Domain Layer · `app/(auth)/onboarding/` |
| **Asignado a** | @aifactory-dev |
| **Reporter** | @juliancuartas |
| **Depende de** | TICKET-FE-TD-001 (HTTP Client + Services Layer) |
| **Rama sugerida** | `feat/ticket-fe-007-onboarding` |
| **Fecha de apertura** | 9 de marzo de 2026 |
| **Fecha de cierre** | 9 de marzo de 2026 |
| **Epic** | AI Software Factory — Frontend Core |

---

## Descripción Original

El ticket requería conectar el frontend con el backend real para el flujo de onboarding:

1. Crear `lib/types/tenant.types.ts` con los tipos del módulo Tenants.
2. Crear `lib/services/tenants.service.ts` con `createTenant`, `getMyTenants`, `updateTenant`.
3. Crear la vista `app/(auth)/onboarding/page.tsx` — formulario premium que llama a `POST /tenants`.
4. Mantener el 100% de cobertura en `lib/services/**`.

---

## Trabajo Adicional Detectado y Ejecutado

Durante el análisis previo al desarrollo se detectó que los tipos y servicios existentes para proyectos y mensajes **no coincidían con la API real del backend** (definida en `FRONTEND_INTEGRATION_GUIDE.md v1.0`). Se resolvió en el mismo ticket para evitar deuda técnica inmediata.

### Discrepancias encontradas y corregidas

| Archivo | Estado previo | Estado corregido |
|---|---|---|
| `project.types.ts` | `id`, `description`, status `'draft'\|'deployed'` | `projectId`, `sourceType`, `threadCount`, status `'DRAFT'\|'UX_DESIGN'\|'CODING'\|'REVIEWING'\|'DEPLOYED'` |
| `message.types.ts` | `MessageRole: 'user'\|'assistant'` | `MessageRole: 'USER'\|'UX_AGENT'\|'FULLSTACK_AGENT'\|'DEVSEC_AGENT'\|'ARCHITECT_AGENT'\|'SYSTEM'` |
| `projects.service.ts` | Rutas planas `/api/projects` | Rutas anidadas `/tenants/:tenantId/projects`; funciones con firma `(tenantId, ...)` |

---

## Trabajo Realizado

### 1. `lib/types/project.types.ts` — Tipos de proyectos corregidos

- `ProjectStatus`: `'DRAFT' | 'UX_DESIGN' | 'CODING' | 'REVIEWING' | 'DEPLOYED'`
- `ProjectSource`: `'NEW_GENERATED' | 'GITHUB_IMPORTED'`
- Entidad `Project`: `projectId`, `sourceType`, `threadCount`
- Nuevos tipos auxiliares: `Thread`, `FirstThread`, `ProjectDetail`, `CreateProjectResponse`
- Eliminados: `UpdateProjectDto` (no expuesto por el backend en v1.0)

### 2. `lib/types/message.types.ts` — Tipos de mensajes corregidos

- `MessageRole` actualizado a los 6 roles reales del backend.
- `PostMessageDto` reducido a solo `{ content: string }` — el backend rechaza `role` con `400` (anti-spoofing).
- Nuevos tipos de respuesta: `PostMessageResponse`, `MessagesResponse`.

### 3. `lib/types/tenant.types.ts` — Tipos de dominio nuevos

Tipos completos para el módulo Tenants:

- `TenantStatus`: `'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED'`
- `TenantRole`: `'ADMIN' | 'EDITOR' | 'ANALYST'`
- `Tenant`: respuesta de `POST /tenants` y `PATCH /tenants/:id`
- `UserTenantMembership`: ítem de la respuesta de `GET /tenants/me` (combina datos del tenant + rol del usuario)
- `CreateTenantDto`, `UpdateTenantDto`

### 4. `lib/services/projects.service.ts` — Service corregido

Rutas migradas al modelo anidado real del backend:

| Función | Ruta |
|---|---|
| `getProjects(tenantId, options?)` | `GET /tenants/:tenantId/projects` |
| `getProjectById(tenantId, projectId, options?)` | `GET /tenants/:tenantId/projects/:projectId` |
| `createProject(tenantId, dto, options?)` | `POST /tenants/:tenantId/projects` |

La respuesta de `getProjects` desenvuelve el wrapper `{ tenantId, projects }` y retorna directamente `Project[]`.

### 5. `lib/services/tenants.service.ts` — Service nuevo

Sigue el mismo patrón arquitectónico que el resto de servicios:

- `createTenant(dto, options?)` → `POST /tenants`
- `getMyTenants(options?)` → `GET /tenants/me`
- `updateTenant(tenantId, dto, options?)` → `PATCH /tenants/:id`

### 6. `app/(auth)/onboarding/page.tsx` — Vista de Onboarding

- Ubicación: bajo el route group `(auth)` — hereda el layout centrado sin sidebar ni topbar.
- `"use client"` — usa `useState`, `useRouter`, `useAuth`.
- Obtiene el JWT con `useAuth().getToken()` antes de cada submit.
- Manejo granular de errores con `instanceof HttpError`:
  - `403` → mensaje de permisos.
  - `400` → nombre inválido.
  - Red caída → mensaje de conexión.
- Estado `isSubmitting` que bloquea el botón y muestra feedback visual.
- Éxito → `router.push('/projects')`.
- UI: fondo `#0a0a0a`, card con `border #2a2a2a`, botón dorado `#a88d47`, tipografía serif en el título.

### 7. `.env.local` — Variables de redirección de Clerk

| Variable | Antes | Después |
|---|---|---|
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/projects` | `/onboarding` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | `/` | `/sign-in` |

### 8. Tests actualizados y nuevos

**`__tests__/lib/services/projects.service.test.ts`** — Reescrito completo:
- Fixtures actualizadas con `projectId`, `sourceType`, `threadCount`, `firstThread`.
- Tests de `getProjects` verifican el desenvuelto del wrapper.
- Tests de `getProjectById` cubren 403 (no miembro del tenant).
- Tests de `createProject` cubren `GITHUB_IMPORTED` con `githubRepoUrl`.
- Eliminados tests de `updateProject` y `deleteProject` (funciones ya no existen).

**`__tests__/lib/services/tenants.service.test.ts`** — Nuevo (10 tests):
- `createTenant`: verifica payload, header `Authorization`, errores 400 y 403.
- `getMyTenants`: verifica array poblado, array vacío, error 401.
- `updateTenant`: verifica PATCH con body, errores 403 y 404.

---

## Resultados Finales

### Tests

```
Test Suites: 8 passed, 8 total
Tests:       81 passed, 81 total
Time:        4.202s
```

### Cobertura

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |     100 |      100 |     100 |     100 |
 components/dashboard |     100 |      100 |     100 |     100 |
  layout.tsx          |     100 |      100 |     100 |     100 |
  sidebar.tsx         |     100 |      100 |     100 |     100 |
  topbar.tsx          |     100 |      100 |     100 |     100 |
 lib/http             |     100 |      100 |     100 |     100 |
  client.ts           |     100 |      100 |     100 |     100 |
 lib/services         |     100 |      100 |     100 |     100 |
  agents.service.ts   |     100 |      100 |     100 |     100 |
  messages.service.ts |     100 |      100 |     100 |     100 |
  projects.service.ts |     100 |      100 |     100 |     100 |
  tenants.service.ts  |     100 |      100 |     100 |     100 |
----------------------|---------|----------|---------|---------|
```

### Build

```
✓ Compiled successfully
✓ Generating static pages (9/9)

Route (app)
├ ○ /onboarding          ← nueva ruta registrada
├ ○ /projects
├ ƒ /sign-in/[[...sign-in]]
└ ƒ /sign-up/[[...sign-up]]

ƒ Proxy (Middleware)     ← guard activo
```

Sin errores de TypeScript. Sin warnings.

---

## Estructura Final de Archivos

```
lib/
  types/
    message.types.ts              ← ✏️ MessageRole con 6 roles reales; PostMessageDto solo content
    project.types.ts              ← ✏️ projectId, sourceType, Thread, FirstThread, ProjectDetail
    tenant.types.ts               ← 🆕 TenantStatus, TenantRole, Tenant, UserTenantMembership, DTOs
    agent.types.ts                ← (sin cambios)
  services/
    projects.service.ts           ← ✏️ rutas anidadas /tenants/:tenantId/projects
    tenants.service.ts            ← 🆕 createTenant, getMyTenants, updateTenant
    messages.service.ts           ← (sin cambios)
    agents.service.ts             ← (sin cambios)

app/
  (auth)/
    onboarding/
      page.tsx                    ← 🆕 formulario de onboarding premium

__tests__/lib/services/
  projects.service.test.ts        ← ✏️ fixtures y tests actualizados
  tenants.service.test.ts         ← 🆕 10 tests, 100% cobertura

.env.local                        ← ✏️ AFTER_SIGN_UP_URL y AFTER_SIGN_OUT_URL
```

---

## Criterios de Aceptación — Verificación

| Criterio | Estado |
|---|---|
| Módulo `tenants` sigue exactamente el mismo patrón que `projects` y `messages` | ✅ |
| Ningún componente hace `fetch()` directamente | ✅ |
| Al registrarse, el usuario es forzado a `/onboarding` antes de ver el dashboard | ✅ via `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` |
| `pnpm test --coverage` mantiene 100% en `lib/services/**` | ✅ |
| Build de producción sin errores TypeScript | ✅ |
| Tipos de dominio coinciden con `FRONTEND_INTEGRATION_GUIDE.md v1.0` | ✅ |

---

## Impacto en los Siguientes Tickets

El próximo ticket de chat/mensajería tiene disponible:

1. `createProject()` devuelve `firstThread.threadId` — listo para navegar al hilo de inmediato.
2. `getMyTenants()` devuelve el rol del usuario — los componentes pueden condicionar acciones por rol (`ADMIN/EDITOR/ANALYST`) sin llamadas adicionales.
3. `PostMessageDto` alineado con el backend — no hay riesgo de enviar campos rechazados.
4. `MessageRole` con todos los agentes disponibles — el renderizado del chat puede mostrar el avatar/nombre correcto por tipo de agente.
