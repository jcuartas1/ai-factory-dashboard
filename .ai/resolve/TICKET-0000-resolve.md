# TICKET-002 — Cierre y Resolución EXAMPLE GUIA
## Integración de Persistencia y Modelado Base (Prisma ORM)

---

## Información del Ticket

| Campo | Valor |
|---|---|
| **ID** | TICKET-002 |
| **Tipo** | Task — Infrastructure / Persistence |
| **Estado** | ✅ Done |
| **Prioridad** | High |
| **Componente** | Infrastructure — Database |
| **Asignado a** | @nest-architect |
| **Reporter** | @juliancuartas |
| **Sprint** | Sprint 1 — Foundations |
| **Story Points** | 8 |
| **Rama** | `saas/ticket-002-prisma` |
| **Fecha de apertura** | 5 de marzo de 2026 |
| **Fecha de cierre** | 5 de marzo de 2026 |
| **Epic** | SaaS AI Backend — Cimientos Arquitectónicos |

---

## Descripción Original

Reemplazar el repositorio en memoria (placeholder `Map`) del módulo `tenant` por una implementación real con **Prisma ORM v5 + PostgreSQL**. La meta principal era realizar este *swap* exclusivamente en la capa de Infraestructura, demostrando que el contrato del Dominio (`ITenantRepository`) permanece intacto y que las capas `application/` y `domain/` no sufren ninguna modificación.

---

## Análisis Previo a la Implementación

Se realizó una auditoría completa del código existente y se presentó un **Resumen Ejecutivo para aprobación**, que incluía:

1. **Listado exacto de comandos** a ejecutar para instalar Prisma.
2. **Árbol de archivos** a crear o modificar en `infrastructure/`.
3. **Estrategia de mocking** con `jest-mock-extended` para cumplir ≥80% de cobertura sin golpear la BD.
4. **Confirmación explícita** de la regla de oro: 0 modificaciones en `domain/` y `application/`.

La implementación solo se inició tras la **aprobación explícita** del Resumen Ejecutivo.

---

## Trabajo Realizado

### Paso 1 — Creación de la rama de aislamiento

```bash
git checkout main
git checkout -b saas/ticket-002-prisma
```

---

### Paso 2 — Instalación de dependencias

```bash
pnpm add @prisma/client@5
pnpm add -D prisma@5 jest-mock-extended
```

Se eligió **Prisma 5** (en lugar de la versión 7 disponible) porque Prisma 7 eliminó la propiedad `url` del datasource en `schema.prisma`, requiriendo una configuración `prisma.config.ts` incompatible con el ecosistema NestJS actual.

También se actualizó `pnpm-workspace.yaml` para habilitar los build scripts de Prisma que estaban en `ignoredBuiltDependencies`.

---

### Paso 3 — Modelado en Prisma Schema

**Archivo creado:** `prisma/schema.prisma`

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("tenants")
}
```

Decisiones de modelado:
- `@default(uuid())` — el UUID se genera a nivel de BD como respaldo, la app genera el suyo en el caso de uso.
- `@@map("tenants")` — convención snake_case para la tabla en PostgreSQL.
- `@map("created_at")` / `@map("updated_at")` — separación entre el modelo TypeScript (camelCase) y la BD (snake_case).
- `updatedAt` solo existe en la BD. La entidad de dominio `Tenant` no fue modificada (no necesita `updatedAt`).

---

### Paso 4 — Migración inicial

```bash
node_modules/.bin/prisma generate
node_modules/.bin/prisma migrate dev --name init_tenant_schema
```

**SQL generado y aplicado:**

```sql
CREATE TABLE "tenants" (
    "id"         TEXT        NOT NULL,
    "name"       TEXT        NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
```

La migración se ejecutó contra el contenedor Docker `saas_ai_db` (Postgres en `localhost:5433`).

**Nota sobre `.env`:** La `DATABASE_URL` original usaba interpolación de variables shell (`${DB_USERNAME}`) que Prisma no soporta. Se reemplazó con valores literales y el carácter `@` del password fue URL-encoded como `%40`.

---

### Paso 5 — PrismaService y PrismaModule

**Archivos creados:**

```
src/infrastructure/database/
├── prisma.service.ts
└── prisma.module.ts
```

`PrismaService` extiende `PrismaClient` e implementa `OnModuleInit` / `OnModuleDestroy` para gestionar el ciclo de vida de la conexión de forma nativa con NestJS.

`PrismaModule` está decorado con `@Global()`, lo que permite que `PrismaService` sea inyectable en cualquier módulo sin necesidad de importarlo repetidamente.

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

---

### Paso 6 — Refactor de TenantPrismaRepository (el swap)

**Archivo modificado:** `src/modules/tenant/infrastructure/repositories/tenant.prisma.repository.ts`

Se reemplazó el `Map` en memoria por llamadas reales a Prisma. La interfaz `ITenantRepository` se mantiene íntegra.

| Método | Implementación anterior | Implementación nueva |
|---|---|---|
| `save` | `store.set(...)` | `prisma.tenant.upsert(...)` |
| `findById` | `store.get(...)` | `prisma.tenant.findUnique(...)` |
| `findAll` | `Array.from(store.values())` | `prisma.tenant.findMany()` |

Se agregó el método privado `toDomain(record: PrismaTenant): Tenant` que mapea el registro de base de datos a la entidad de dominio, manteniendo la barrera anti-corrupción entre la capa de infraestructura y el dominio.

---

### Paso 7 — Actualización de módulos

**`TenantModule`** fue actualizado para importar `PrismaModule` explícitamente (buena práctica de legibilidad), garantizando que `PrismaService` esté disponible para inyección en `TenantPrismaRepository`.

**`AppModule`** fue actualizado para importar `PrismaModule` como módulo global raíz.

---

### Paso 8 — Suite de Tests Unitarios

Se crearon **5 archivos spec** con un total de **24 tests**, todos con mock — ninguno toca la base de datos real:

#### `tenant.prisma.repository.spec.ts` (8 tests)
Usa `jest-mock-extended` → `mockDeep<PrismaClient>()` para interceptar cada llamada anidada (`prisma.tenant.create`, etc.).

| Test | Descripción |
|---|---|
| `save` → llamада correcta | Verifica que `upsert` recibe los parámetros exactos |
| `save` → error propagado | Verifica que un fallo de BD llega hasta el caller |
| `findById` → entidad encontrada | Retorna entidad `Tenant` mapeada correctamente |
| `findById` → entidad no encontrada | Retorna `null` |
| `findById` → query correcta | Verifica el `where: { id }` |
| `findAll` → array con registros | Retorna array de entidades mapeadas |
| `findAll` → array vacío | Retorna `[]` cuando la BD está vacía |
| `toDomain` → mapping correcto | Verifica la conversión PrismaRecord → Entidad de dominio |

#### `prisma.service.spec.ts` (3 tests)
Mockea `$connect` y `$disconnect` con `jest.spyOn`. Valida el ciclo de vida del módulo.

#### `create-tenant.use-case.spec.ts` (4 tests)
Usa `jest.Mocked<ITenantRepository>` para aislar el caso de uso del repositorio. Verifica la generación de UUID único por ejecución y la propagación de errores.

#### `tenant.controller.spec.ts` (3 tests)
Mockea `CreateTenantUseCase`. Verifica la delegación correcta y la propagación de errores HTTP.

#### `tenant-id.value-object.spec.ts` (6 tests)
Cubre todas las invariantes del Value Object: construcción válida, rechazo de vacíos, `toString()` y `equals()`.

---

### Paso 9 — Actualización del Test E2E

El test E2E fue actualizado para:
- Usar `beforeAll`/`afterAll` en lugar de `beforeEach`/`afterEach` (evitar reconexiones innecesarias).
- Inyectar `PrismaService` para limpiar la tabla `tenants` antes de cada test (`deleteMany()`).
- Verificar que el registro insertado existe realmente en la BD tras el `POST /tenants`.

---

### Paso 10 — Correcciones de configuración

| Archivo | Cambio | Razón |
|---|---|---|
| `tsconfig.json` | `"types": ["jest", "node"]` | Resolvía los errores de globales Jest (`describe`, `it`, `expect`) en el IDE |
| `package.json` (jest) | `collectCoverageFrom` excluye `main.ts` y `*.module.ts` | Bootstrap y wire-up declarativo no son testeables unitariamente |
| `.vscode/settings.json` | `prisma.schemaPath` configurado | Apunta la extensión al schema correcto |
| `pnpm-workspace.yaml` | Removido `@prisma/engines` y `prisma` de `ignoredBuiltDependencies` | Necesario para ejecutar `prisma generate` y `prisma migrate` |

---

## Regla de Dependencia — Verificación de Desacoplamiento

```
TenantController → CreateTenantUseCase → ITenantRepository ← TenantPrismaRepository
    (infra)           (application)          (domain)              (infra)
                                                ↑
                                         PrismaService
                                           (infra)
```

**Archivos con CERO modificaciones:**

| Archivo | Estado |
|---|---|
| `domain/entities/tenant.entity.ts` | ✅ Intacto |
| `domain/value-objects/tenant-id.value-object.ts` | ✅ Intacto (solo se creó spec) |
| `domain/repositories/tenant.repository.interface.ts` | ✅ Intacto |
| `application/use-cases/create-tenant.use-case.ts` | ✅ Intacto (solo se creó spec) |
| `application/dtos/create-tenant.dto.ts` | ✅ Intacto |

---

## Resultados Finales

### Build de producción

```bash
pnpm build  →  ✅ Sin errores de tipado
```

### Cobertura de tests

```
Test Suites: 5 passed, 5 total
Tests:       24 passed, 24 total

All files   | 100% Stmts | 100% Branch | 100% Funcs | 100% Lines
```

---

## Criterios de Aceptación — Verificación

| Criterio | Estado |
|---|---|
| Rama `saas/ticket-002-prisma` creada desde `main` | ✅ |
| `@prisma/client@5` (prod) y `prisma@5` + `jest-mock-extended` (dev) instalados | ✅ |
| Modelo `Tenant` en `schema.prisma` con UUID, name, createdAt, updatedAt y `@@map("tenants")` | ✅ |
| `PrismaService` extiende `PrismaClient` con `OnModuleInit`/`OnModuleDestroy` | ✅ |
| `PrismaModule` global creado y exportado | ✅ |
| `TenantPrismaRepository` usa `PrismaService` y cumple `ITenantRepository` | ✅ |
| Tests unitarios con mock de `PrismaService` (`jest-mock-extended`) | ✅ |
| Cobertura ≥80% en el módulo modificado | ✅ **100%** |
| `pnpm prisma migrate dev --name init_tenant_schema` ejecutado exitosamente | ✅ |
| Test E2E verifica inserción y recuperación real desde PostgreSQL | ✅ |
| `pnpm build` exitoso sin errores de tipado | ✅ |
| **ZERO modificaciones en `domain/` y `application/`** | ✅ |

---

## Decisiones Técnicas y Justificaciones

| Decisión | Alternativa Considerada | Justificación |
|---|---|---|
| Prisma **v5** en lugar de v7 | Prisma 7 | v7 eliminó `url` en datasource; requiere `prisma.config.ts` incompatible con el stack NestJS actual |
| `upsert` en el método `save` | `create` directo | Soporta tanto insert como update desde el mismo contrato `save(tenant)` |
| `@Global()` en `PrismaModule` | Import por módulo | Evita el boilerplate de importar `PrismaModule` en cada nuevo módulo de negocio |
| `toDomain()` privado en el repositorio | Mapper externo | El repositorio es el único que conoce el esquema Prisma; el mapper es un detalle de implementación |
| `beforeAll`/`afterAll` en E2E | `beforeEach`/`afterEach` | Evita reconectar la app en cada test; `deleteMany()` garantiza aislamiento a nivel de datos |
| Excluir `*.module.ts` de cobertura | Incluirlos | Son archivos declarativos de wire-up; no tienen lógica de negocio testeable unitariamente |

---

## Deuda Técnica Identificada (próximos tickets)

- [ ] Agregar **`class-validator`** y **`class-transformer`** a los DTOs para validación de entrada en el controlador.
- [ ] Implementar **`ExceptionFilter` global** para mapear errores de Prisma (ej. `P2002` unique constraint) a respuestas HTTP semánticas.
- [ ] Agregar el módulo **`ConfigModule`** de NestJS para gestionar las variables de entorno de forma tipada en lugar de leer directamente desde `.env`.
- [ ] Crear un **script de seed** para poblar datos iniciales en entornos de desarrollo/staging.
- [ ] Considerar upgrade a **Prisma 7** cuando el ecosistema NestJS documente el patrón `prisma.config.ts`.

---

## Archivos Afectados (resumen final)

```
CREADOS
  prisma/schema.prisma
  prisma/migrations/20260305130102_init_tenant_schema/migration.sql
  src/infrastructure/database/prisma.service.ts
  src/infrastructure/database/prisma.module.ts
  src/infrastructure/database/prisma.service.spec.ts
  src/modules/tenant/domain/value-objects/tenant-id.value-object.spec.ts
  src/modules/tenant/application/use-cases/create-tenant.use-case.spec.ts
  src/modules/tenant/infrastructure/controllers/tenant.controller.spec.ts
  src/modules/tenant/infrastructure/repositories/tenant.prisma.repository.spec.ts
  .vscode/settings.json

MODIFICADOS
  src/app.module.ts                            (importa PrismaModule)
  src/modules/tenant/infrastructure/tenant.module.ts  (importa PrismaModule)
  src/modules/tenant/infrastructure/repositories/tenant.prisma.repository.ts  (swap Map → Prisma)
  test/app.e2e-spec.ts                         (limpieza BD + verificación real)
  tsconfig.json                                (types: jest, node)
  package.json                                 (collectCoverageFrom actualizado)
  pnpm-workspace.yaml                          (habilitados build scripts Prisma)
  .env                                         (DATABASE_URL con valores literales + URL encoding)

SIN MODIFICAR (regla de oro ✅)
  src/modules/tenant/domain/entities/tenant.entity.ts
  src/modules/tenant/domain/repositories/tenant.repository.interface.ts
  src/modules/tenant/application/use-cases/create-tenant.use-case.ts
  src/modules/tenant/application/dtos/create-tenant.dto.ts
```

---

*Cerrado por @nest-architect — 5 de marzo de 2026*
