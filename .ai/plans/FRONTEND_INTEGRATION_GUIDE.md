# Frontend Integration Guide — SaaS AI Backend
> **Versión:** 1.0 · **Fecha:** 9 de marzo de 2026  
> **Base URL:** `http://localhost:3002`  
> **Entorno de producción:** definir en variables de entorno del frontend (`NEXT_PUBLIC_API_URL`)

---

## Tabla de Contenidos
1. [Arquitectura General](#1-arquitectura-general)
2. [Autenticación con Clerk](#2-autenticación-con-clerk)
3. [Sistema de Roles](#3-sistema-de-roles)
4. [Formato de Respuesta de Errores](#4-formato-de-respuesta-de-errores)
5. [Módulo: Tenants](#5-módulo-tenants)
6. [Módulo: Proyectos y Chat](#6-módulo-proyectos-y-chat)
7. [Webhook Interno (solo Clerk → Backend)](#7-webhook-interno-solo-clerk--backend)
8. [Enums de Referencia](#8-enums-de-referencia)
9. [Flujos Completos End-to-End](#9-flujos-completos-end-to-end)
10. [Checklist de Integración](#10-checklist-de-integración)

---

## 1. Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend (Next.js / React)          │
│                                                          │
│  Clerk JS SDK ──────► Obtiene JWT del usuario autenticado│
│  Axios / Fetch ──────► Envía Bearer token en cada request│
└──────────────────────────────────┬───────────────────────┘
                                   │  HTTP REST
                                   ▼
┌──────────────────────────────────────────────────────────┐
│                   NestJS Backend (Puerto 3002)           │
│                                                          │
│  ClerkAuthGuard (global) ── verifica JWT en Clerk        │
│  GlobalRoleGuard          ── verifica rol de plataforma  │
│  TenantRoleGuard          ── verifica rol dentro tenant  │
│                                                          │
│  /tenants            ── TENANT MODULE                    │
│  /tenants/:id/projects── PROJECT MODULE                  │
│  /webhooks/clerk     ── WEBHOOK (no requiere auth)       │
└──────────────────────────────────────────────────────────┘
```

**Regla principal:** Cada request protegido **debe** llevar el header:
```
Authorization: Bearer <clerk_jwt_token>
```

---

## 2. Autenticación con Clerk

### 2.1 Cómo obtener el token (SDK de Clerk en el frontend)

```typescript
// Con @clerk/nextjs
import { useAuth } from '@clerk/nextjs';

function useApiClient() {
  const { getToken } = useAuth();

  const request = async (url: string, options: RequestInit = {}) => {
    const token = await getToken(); // JWT firmado por Clerk

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  return { request };
}
```

### 2.2 Headers obligatorios en todo request protegido

| Header          | Valor                        | Requerido |
|-----------------|------------------------------|-----------|
| `Authorization` | `Bearer <jwt_token>`         | ✅ Sí     |
| `Content-Type`  | `application/json`           | ✅ Sí     |

### 2.3 Sincronización automática de usuarios

Cuando un usuario se registra en Clerk, Clerk envía un webhook a `POST /webhooks/clerk`.  
El backend crea automáticamente el usuario en la base de datos con `globalRole = BUSINESS_OWNER`.  
**El frontend no necesita llamar a ningún endpoint de "registro".**

---

## 3. Sistema de Roles

### 3.1 Roles Globales de Plataforma (`GlobalRole`)

| Rol              | Descripción                                                        |
|------------------|--------------------------------------------------------------------|
| `SUPER_ADMIN`    | Operador interno de la plataforma. Acceso total.                   |
| `BUSINESS_OWNER` | Usuario que puede crear y administrar sus propios tenants. **Default al registrarse.** |
| `REGULAR_USER`   | Usuario invitado a un tenant. No puede crear tenants.             |

### 3.2 Roles Locales dentro de un Tenant (`Role`)

| Rol        | Descripción                                     | Puede crear proyectos | Puede enviar mensajes | Solo lectura |
|------------|-------------------------------------------------|-----------------------|-----------------------|--------------|
| `ADMIN`    | Administrador del tenant                         | ✅                    | ✅                    | ✅           |
| `EDITOR`   | Puede editar y trabajar con proyectos            | ✅                    | ✅                    | ✅           |
| `ANALYST`  | Solo lectura — puede ver proyectos e hilos       | ❌                    | ❌                    | ✅           |

### 3.3 Resumen de accesos por endpoint

| Endpoint                             | GlobalRole requerido           | Role de Tenant requerido     |
|--------------------------------------|-------------------------------|------------------------------|
| `POST /tenants`                      | `BUSINESS_OWNER` o `SUPER_ADMIN` | —                            |
| `GET /tenants/me`                    | Cualquiera autenticado         | —                            |
| `PATCH /tenants/:id`                 | —                              | `ADMIN` o `EDITOR`           |
| `GET /tenants/:id/projects`          | —                              | `ADMIN`, `EDITOR` o `ANALYST`|
| `POST /tenants/:id/projects`         | —                              | `ADMIN` o `EDITOR`           |
| `GET /tenants/:id/projects/:pid`     | —                              | `ADMIN`, `EDITOR` o `ANALYST`|
| `POST /tenants/:id/projects/:pid/threads` | —                        | `ADMIN` o `EDITOR`           |
| `GET .../threads/:tid/messages`      | —                              | `ADMIN`, `EDITOR` o `ANALYST`|
| `POST .../threads/:tid/messages`     | —                              | `ADMIN` o `EDITOR`           |

---

## 4. Formato de Respuesta de Errores

Todos los errores siguen esta estructura JSON unificada:

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-09T10:00:00.000Z",
  "path": "/tenants",
  "message": "El nombre del tenant no puede estar vacío.",
  "error": "Bad Request"
}
```

### Códigos de Estado HTTP esperados

| Código | Causa                                                                  |
|--------|------------------------------------------------------------------------|
| `400`  | Body inválido — campo faltante, tipo incorrecto, propiedad no permitida |
| `401`  | Token JWT ausente, expirado o inválido                                 |
| `403`  | Token válido pero el usuario no tiene el rol suficiente                |
| `404`  | Recurso no encontrado (tenant, proyecto, hilo)                         |
| `409`  | Conflicto — ej. el usuario ya es miembro del tenant                   |
| `500`  | Error interno del servidor                                             |

> ⚠️ **Importante:** Si llegas a enviar una propiedad que no está en el DTO (ej. `"role"` en `sendMessage`), el backend responde `400` con `"property role should not exist"`. El `ValidationPipe` tiene `forbidNonWhitelisted: true`.

---

## 5. Módulo: Tenants

### 5.1 `POST /tenants` — Crear Tenant

**Requiere:** GlobalRole `BUSINESS_OWNER` o `SUPER_ADMIN`

#### Request
```http
POST /tenants
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "name": "Mi Empresa SAS"
}
```

#### Validaciones del campo `name`
- Tipo: `string`
- Mínimo: 1 carácter, Máximo: 100 caracteres
- No puede estar vacío

#### Response `201 Created`
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Mi Empresa SAS",
  "status": "PENDING_PAYMENT",
  "createdAt": "2026-03-09T10:00:00.000Z"
}
```

#### Campos de respuesta

| Campo       | Tipo     | Descripción                                              |
|-------------|----------|----------------------------------------------------------|
| `id`        | `string` | UUID del tenant — guardar para todas las peticiones siguientes |
| `name`      | `string` | Nombre del tenant                                        |
| `status`    | `string` | Estado inicial siempre es `PENDING_PAYMENT`              |
| `createdAt` | `string` | ISO 8601 timestamp                                       |

#### Errores posibles
```json
// 400 - Nombre vacío
{ "statusCode": 400, "message": "El nombre del tenant no puede estar vacío." }

// 400 - Nombre demasiado largo
{ "statusCode": 400, "message": "El nombre no puede superar los 100 caracteres." }

// 403 - Usuario con rol REGULAR_USER intenta crear tenant
{ "statusCode": 403, "message": "Forbidden resource" }
```

---

### 5.2 `GET /tenants/me` — Listar Tenants del Usuario

Retorna todos los tenants a los que pertenece el usuario autenticado.

#### Request
```http
GET /tenants/me
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

#### Response `200 OK`
```json
[
  {
    "tenantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tenantName": "Mi Empresa SAS",
    "tenantStatus": "ACTIVE",
    "role": "ADMIN",
    "joinedAt": "2026-03-09T10:00:00.000Z"
  },
  {
    "tenantId": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "tenantName": "Startup XYZ",
    "tenantStatus": "PENDING_PAYMENT",
    "role": "EDITOR",
    "joinedAt": "2026-03-08T14:30:00.000Z"
  }
]
```

#### Campos de respuesta

| Campo          | Tipo     | Descripción                          |
|----------------|----------|--------------------------------------|
| `tenantId`     | `string` | UUID del tenant                      |
| `tenantName`   | `string` | Nombre del tenant                    |
| `tenantStatus` | `string` | Estado: `PENDING_PAYMENT`, `ACTIVE`, `SUSPENDED` |
| `role`         | `string` | Rol del usuario en ese tenant: `ADMIN`, `EDITOR`, `ANALYST` |
| `joinedAt`     | `string` | ISO 8601 — cuándo se unió al tenant  |

> Si el usuario no pertenece a ningún tenant, retorna `[]`.

---

### 5.3 `PATCH /tenants/:id` — Actualizar Nombre del Tenant

**Requiere:** Role de Tenant `ADMIN` o `EDITOR`

#### Request
```http
PATCH /tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "name": "Mi Empresa SAS Actualizada"
}
```

#### Validaciones
- `name`: string, mínimo 2 caracteres, máximo 100 caracteres

#### Response `200 OK`
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Mi Empresa SAS Actualizada",
  "status": "ACTIVE"
}
```

#### Errores posibles
```json
// 403 - ANALYST intenta actualizar
{ "statusCode": 403, "message": "Forbidden resource" }

// 404 - Tenant no existe
{ "statusCode": 404, "message": "Tenant not found" }
```

---

## 6. Módulo: Proyectos y Chat

> Todos los endpoints de proyectos están anidados bajo `/tenants/:tenantId/projects`.  
> El `tenantId` debe existir y el usuario debe ser miembro del tenant.

---

### 6.1 `GET /tenants/:tenantId/projects` — Listar Proyectos

**Requiere:** Role `ADMIN`, `EDITOR` o `ANALYST`

#### Request
```http
GET /tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890/projects
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

#### Response `200 OK`
```json
{
  "tenantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "projects": [
    {
      "projectId": "c3d4e5f6-a7b8-9012-cdef-012345678901",
      "name": "Portal de Clientes",
      "status": "CODING",
      "sourceType": "NEW_GENERATED",
      "threadCount": 3,
      "createdAt": "2026-03-09T12:00:00.000Z"
    },
    {
      "projectId": "d4e5f6g7-b8c9-0123-defg-123456789012",
      "name": "API E-commerce",
      "status": "DRAFT",
      "sourceType": "GITHUB_IMPORTED",
      "threadCount": 1,
      "createdAt": "2026-03-08T09:00:00.000Z"
    }
  ]
}
```

#### Campos de respuesta (cada proyecto)

| Campo         | Tipo     | Descripción                                           |
|---------------|----------|-------------------------------------------------------|
| `projectId`   | `string` | UUID del proyecto                                     |
| `name`        | `string` | Nombre del proyecto                                   |
| `status`      | `string` | Estado actual del ciclo de vida (ver Enums)           |
| `sourceType`  | `string` | `NEW_GENERATED` o `GITHUB_IMPORTED`                   |
| `threadCount` | `number` | Cantidad de hilos de chat asociados                   |
| `createdAt`   | `string` | ISO 8601                                              |

> Proyectos ordenados por `createdAt DESC` (más nuevo primero).

---

### 6.2 `POST /tenants/:tenantId/projects` — Crear Proyecto

**Requiere:** Role `ADMIN` o `EDITOR`

Crea un proyecto **y** su hilo de chat inicial en una **transacción atómica**.

#### Request — Proyecto generado desde cero
```http
POST /tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890/projects
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "name": "Portal de Clientes",
  "sourceType": "NEW_GENERATED"
}
```

#### Request — Proyecto importado desde GitHub
```http
POST /tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890/projects
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "name": "API E-commerce",
  "sourceType": "GITHUB_IMPORTED",
  "githubRepoUrl": "https://github.com/mi-org/mi-repo",
  "vercelDeploymentUrl": "https://mi-app.vercel.app"
}
```

#### Validaciones

| Campo                | Tipo      | Requerido                             | Reglas                            |
|----------------------|-----------|---------------------------------------|-----------------------------------|
| `name`               | `string`  | ✅ Siempre                            | min:2, max:100                    |
| `sourceType`         | `string`  | ✅ Siempre                            | `NEW_GENERATED` o `GITHUB_IMPORTED` |
| `githubRepoUrl`      | `string`  | ✅ Solo si `sourceType = GITHUB_IMPORTED` | URL válida (https)            |
| `vercelDeploymentUrl`| `string`  | ❌ Opcional                           | URL válida si se envía            |

#### Response `201 Created`
```json
{
  "projectId": "c3d4e5f6-a7b8-9012-cdef-012345678901",
  "name": "Portal de Clientes",
  "status": "DRAFT",
  "sourceType": "NEW_GENERATED",
  "githubRepoUrl": null,
  "firstThread": {
    "threadId": "e5f6g7h8-c9d0-1234-efgh-234567890123",
    "title": "Hilo inicial",
    "status": "OPEN"
  }
}
```

#### Campos importantes de la respuesta

| Campo                    | Descripción                                                          |
|--------------------------|----------------------------------------------------------------------|
| `projectId`              | Guardar para las llamadas siguientes                                  |
| `status`                 | Siempre `DRAFT` al crear                                             |
| `firstThread.threadId`   | ID del hilo inicial — usar para empezar a enviar mensajes de inmediato |

#### Errores posibles
```json
// 400 - githubRepoUrl faltante cuando sourceType = GITHUB_IMPORTED
{
  "statusCode": 400,
  "message": ["githubRepoUrl must be a valid URL"]
}

// 400 - sourceType inválido
{
  "statusCode": 400,
  "message": ["sourceType must be one of the following values: NEW_GENERATED, GITHUB_IMPORTED"]
}
```

---

### 6.3 `GET /tenants/:tenantId/projects/:projectId` — Detalle de Proyecto

**Requiere:** Role `ADMIN`, `EDITOR` o `ANALYST`

#### Request
```http
GET /tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890/projects/c3d4e5f6-a7b8-9012-cdef-012345678901
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

#### Response `200 OK`
```json
{
  "projectId": "c3d4e5f6-a7b8-9012-cdef-012345678901",
  "name": "Portal de Clientes",
  "status": "CODING",
  "sourceType": "NEW_GENERATED",
  "githubRepoUrl": null,
  "vercelDeploymentUrl": null,
  "threads": [
    {
      "threadId": "e5f6g7h8-c9d0-1234-efgh-234567890123",
      "title": "Hilo inicial",
      "status": "OPEN",
      "branchName": null,
      "prUrl": null,
      "createdAt": "2026-03-09T12:00:00.000Z"
    },
    {
      "threadId": "f6g7h8i9-d0e1-2345-fghi-345678901234",
      "title": "Correción de bugs de autenticación",
      "status": "PR_CREATED",
      "branchName": "fix/auth-bugs",
      "prUrl": "https://github.com/mi-org/mi-repo/pull/42",
      "createdAt": "2026-03-08T15:00:00.000Z"
    }
  ],
  "createdAt": "2026-03-09T12:00:00.000Z"
}
```

> Los hilos están ordenados por `createdAt DESC`.

---

### 6.4 `POST /tenants/:tenantId/projects/:projectId/threads` — Crear Nuevo Hilo

**Requiere:** Role `ADMIN` o `EDITOR`

Crea un nuevo hilo de chat dentro de un proyecto existente.

#### Request
```http
POST /tenants/a1b2c3d4/projects/c3d4e5f6-a7b8-9012-cdef-012345678901/threads
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "title": "Implementar sistema de pagos con Stripe"
}
```

#### Validaciones

| Campo   | Tipo     | Requerido | Reglas          |
|---------|----------|-----------|-----------------|
| `title` | `string` | ✅ Sí     | min:2, max:200  |

#### Response `201 Created`
```json
{
  "threadId": "g7h8i9j0-e1f2-3456-ghij-456789012345",
  "projectId": "c3d4e5f6-a7b8-9012-cdef-012345678901",
  "title": "Implementar sistema de pagos con Stripe",
  "status": "OPEN"
}
```

---

### 6.5 `GET /tenants/:tenantId/projects/:projectId/threads/:threadId/messages` — Historial de Mensajes

**Requiere:** Role `ADMIN`, `EDITOR` o `ANALYST`

#### Request
```http
GET /tenants/a1b2c3d4/projects/c3d4e5f6/threads/e5f6g7h8-c9d0-1234-efgh-234567890123/messages
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

#### Response `200 OK`
```json
{
  "threadId": "e5f6g7h8-c9d0-1234-efgh-234567890123",
  "messages": [
    {
      "messageId": "h8i9j0k1-f2g3-4567-hijk-567890123456",
      "role": "USER",
      "content": "Necesito un sistema de login con redes sociales",
      "createdAt": "2026-03-09T12:05:00.000Z"
    },
    {
      "messageId": "i9j0k1l2-g3h4-5678-ijkl-678901234567",
      "role": "ARCHITECT_AGENT",
      "content": "Entendido. Voy a diseñar la arquitectura de autenticación usando OAuth 2.0...",
      "createdAt": "2026-03-09T12:05:10.000Z"
    },
    {
      "messageId": "j0k1l2m3-h4i5-6789-jklm-789012345678",
      "role": "UX_AGENT",
      "content": "He preparado los wireframes para el flujo de login social...",
      "createdAt": "2026-03-09T12:05:25.000Z"
    }
  ]
}
```

> Mensajes ordenados por `createdAt ASC` (cronológico — igual que el contexto del LLM).

#### Roles posibles en los mensajes (`MessageRole`)

| Valor              | Descripción                        |
|--------------------|------------------------------------|
| `USER`             | Mensaje enviado por el usuario     |
| `UX_AGENT`         | Respuesta del agente de UX/Diseño  |
| `FULLSTACK_AGENT`  | Respuesta del agente de código     |
| `DEVSEC_AGENT`     | Respuesta del agente de seguridad  |
| `ARCHITECT_AGENT`  | Respuesta del agente arquitecto    |
| `SYSTEM`           | Mensaje de sistema / metadatos     |

---

### 6.6 `POST /tenants/:tenantId/projects/:projectId/threads/:threadId/messages` — Enviar Mensaje

**Requiere:** Role `ADMIN` o `EDITOR`

#### Request
```http
POST /tenants/a1b2c3d4/projects/c3d4e5f6/threads/e5f6g7h8/messages
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "content": "Necesito agregar autenticación con Google y GitHub"
}
```

#### Validaciones

| Campo     | Tipo     | Requerido | Reglas             |
|-----------|----------|-----------|--------------------|
| `content` | `string` | ✅ Sí     | min:1 carácter     |

#### ⚠️ SEGURIDAD ANTI-SPOOFING
**NO envíes el campo `role`** en el body. El backend lo rechazará con `400`.  
El servidor fuerza `role = USER` automáticamente. No hay forma de que el cliente elija el rol.

```json
// ❌ INCORRECTO — generará error 400
{
  "content": "Mi mensaje",
  "role": "ARCHITECT_AGENT"
}

// ✅ CORRECTO
{
  "content": "Mi mensaje"
}
```

#### Response `201 Created`
```json
{
  "messageId": "k1l2m3n4-i5j6-7890-klmn-890123456789",
  "threadId": "e5f6g7h8-c9d0-1234-efgh-234567890123",
  "role": "USER",
  "content": "Necesito agregar autenticación con Google y GitHub",
  "createdAt": "2026-03-09T14:00:00.000Z"
}
```

---

## 7. Webhook Interno (solo Clerk → Backend)

El endpoint `POST /webhooks/clerk` es **exclusivamente para uso de Clerk**.  
El frontend **no debe** llamar a este endpoint directamente.

| Detalle  | Valor                                              |
|----------|----------------------------------------------------|
| URL      | `POST /webhooks/clerk`                             |
| Auth     | No requiere Bearer token (es `@Public()`)          |
| Propósito| Sincronizar usuarios nuevos de Clerk a la BD local |
| Evento   | Solo reacciona a `user.created`                    |

Cuando Clerk llama a este endpoint, el backend registra al usuario en PostgreSQL con `globalRole = BUSINESS_OWNER` por defecto.

---

## 8. Enums de Referencia

### `TenantStatus`
| Valor             | Descripción                          |
|-------------------|--------------------------------------|
| `PENDING_PAYMENT` | Estado inicial — sin suscripción activa |
| `ACTIVE`          | Suscripción vigente                  |
| `SUSPENDED`       | Suspendido por falta de pago         |

### `ProjectStatus`
| Valor       | Descripción                              |
|-------------|------------------------------------------|
| `DRAFT`     | Estado inicial — sin agentes activos     |
| `UX_DESIGN` | Agente UX trabajando en el diseño        |
| `CODING`    | Agente FullStack generando código        |
| `REVIEWING` | Agente DevSec auditando seguridad        |
| `DEPLOYED`  | Proyecto desplegado en Vercel            |

### `ProjectSource`
| Valor             | Descripción                               |
|-------------------|-------------------------------------------|
| `NEW_GENERATED`   | Proyecto generado desde cero por agentes  |
| `GITHUB_IMPORTED` | Proyecto importado desde GitHub           |

### `ThreadStatus`
| Valor        | Descripción                  |
|--------------|------------------------------|
| `OPEN`       | Hilo activo                  |
| `RESOLVING`  | PR en preparación            |
| `PR_CREATED` | PR abierto en GitHub         |
| `MERGED`     | PR mergeado a main           |
| `CLOSED`     | Cerrado manualmente          |

### `MessageRole`
| Valor              | Descripción                    |
|--------------------|--------------------------------|
| `USER`             | Mensaje del usuario            |
| `UX_AGENT`         | Agente de UX/Diseño            |
| `FULLSTACK_AGENT`  | Agente de código full-stack    |
| `DEVSEC_AGENT`     | Agente de seguridad            |
| `ARCHITECT_AGENT`  | Agente arquitecto              |
| `SYSTEM`           | Mensaje de sistema             |

---

## 9. Flujos Completos End-to-End

### Flujo 1: Nuevo usuario crea su primera organización y proyecto

```
1. Usuario se registra en Clerk (frontend)
      │
      ▼
2. Clerk envía webhook → POST /webhooks/clerk
   Backend crea el User en BD con globalRole = BUSINESS_OWNER
      │
      ▼
3. Frontend obtiene token JWT → getToken()
      │
      ▼
4. POST /tenants
   Body: { "name": "Mi Empresa" }
   → Retorna { id, name, status: "PENDING_PAYMENT" }
   → GUARDAR el tenantId en el estado / store
      │
      ▼
5. POST /tenants/:tenantId/projects
   Body: { "name": "Mi App", "sourceType": "NEW_GENERATED" }
   → Retorna { projectId, firstThread: { threadId } }
   → GUARDAR projectId y firstThread.threadId
      │
      ▼
6. POST /tenants/:tenantId/projects/:projectId/threads/:threadId/messages
   Body: { "content": "Quiero crear una app de gestión de tareas con Next.js" }
   → El agente IA responderá (implementación futura vía WebSocket/SSE)
```

---

### Flujo 2: Usuario navega a un tenant existente

```
1. GET /tenants/me
   → Lista de tenants con role del usuario en cada uno
      │
      ▼
2. Usuario selecciona un tenant → guardar tenantId
      │
      ▼
3. GET /tenants/:tenantId/projects
   → Lista de proyectos del tenant
      │
      ▼
4. Usuario abre un proyecto → guardar projectId
      │
      ▼
5. GET /tenants/:tenantId/projects/:projectId
   → Detalle del proyecto con sus hilos
      │
      ▼
6. Usuario abre un hilo → guardar threadId
      │
      ▼
7. GET /tenants/:tenantId/projects/:projectId/threads/:threadId/messages
   → Historial de mensajes del hilo
```

---

### Flujo 3: ANALYST navega el sistema (solo lectura)

```
// ✅ Acciones permitidas:
GET /tenants/me                               → ver sus tenants
GET /tenants/:id/projects                     → ver proyectos
GET /tenants/:id/projects/:pid                → ver detalle
GET /tenants/:id/projects/:pid/threads/:tid/messages → ver mensajes

// ❌ Acciones bloqueadas (HTTP 403):
POST /tenants                                 → no puede crear tenants
POST /tenants/:id/projects                    → no puede crear proyectos
POST /tenants/:id/projects/:pid/threads       → no puede crear hilos
POST .../threads/:tid/messages                → no puede enviar mensajes
PATCH /tenants/:id                            → no puede editar tenant
```

---

## 10. Checklist de Integración

### Configuración inicial
- [ ] Instalar `@clerk/nextjs` (o `@clerk/react`) en el frontend
- [ ] Configurar `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` en variables de entorno
- [ ] Configurar `NEXT_PUBLIC_API_URL=http://localhost:3002` en desarrollo
- [ ] Envolver la app con `<ClerkProvider>` en el layout raíz

### Gestión de tokens
- [ ] Usar `useAuth().getToken()` para obtener JWT en cada request
- [ ] Nunca cachear el token por más de su tiempo de expiración
- [ ] Manejar `401` redirigiendo al usuario al flujo de login de Clerk

### Gestión de roles
- [ ] Al cargar los tenants del usuario (`GET /tenants/me`), guardar el `role` de cada tenant
- [ ] Deshabilitar/ocultar botones de creación si el usuario es `ANALYST`
- [ ] Mostrar estado de suscripción (`tenantStatus`) para alertar sobre `PENDING_PAYMENT`

### Manejo de errores
- [ ] Interceptor global en Axios/Fetch para manejar `401` → redirigir a login
- [ ] Interceptor para `403` → mostrar mensaje "No tienes permisos"
- [ ] Mostrar mensajes de validación (`400`) del array `message` de la respuesta de error

### Identificadores clave a persistir en el estado
- [ ] `clerkId` — viene del token de Clerk (campo `sub`)
- [ ] `tenantId` — obtenido de `POST /tenants` o `GET /tenants/me`
- [ ] `projectId` — obtenido de `POST /tenants/:id/projects` o `GET /tenants/:id/projects`
- [ ] `threadId` — obtenido de `POST /tenants/:id/projects/:pid/threads` o del detalle del proyecto

---

## Notas adicionales

### Propiedades extra en el body → HTTP 400
El backend tiene `forbidNonWhitelisted: true`. Cualquier propiedad que no esté definida en el DTO dispara un error `400`. Enviar solo los campos documentados.

### Puerto en desarrollo
El backend corre en el puerto **3002** (no el 3000 estándar). Verificar que la variable de entorno del frontend apunte al puerto correcto.

### IDs tipo UUID v4
Todos los IDs (`tenantId`, `projectId`, `threadId`, `messageId`) son UUIDs v4 en formato string: `"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`.

### Sin paginación (MVP)
Los endpoints de listado (`GET /projects`, `GET /messages`) retornan **todos** los registros sin paginación. Se implementará en versiones futuras.
