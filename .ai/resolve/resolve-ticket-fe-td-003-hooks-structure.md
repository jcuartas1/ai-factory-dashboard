# TICKET-FE-TD-003 — Cierre y Resolución
## Refactor — Reorganizar `hooks/` — Separar UI de Dominio

---

## Información del Ticket

| Campo | Valor |
|---|---|
| **ID** | TICKET-FE-TD-003 |
| **Tipo** | Deuda Técnica — Arquitectura |
| **Estado** | ✅ Done |
| **Prioridad** | 🟡 Baja |
| **Componente** | Frontend — `hooks/` Architecture |
| **Asignado a** | @aifactory-dev |
| **Reporter** | @juliancuartas |
| **Detectado en** | Auditoría post TICKET-FE-003 |
| **Rama sugerida** | `refactor/ticket-fe-td-003-hooks-structure` |
| **Fecha de apertura** | 9 de marzo de 2026 |
| **Fecha de cierre** | 9 de marzo de 2026 |
| **Epic** | AI Software Factory — Frontend Core |

---

## Descripción Original

`hooks/` mezclaba hooks de infraestructura UI (primitivos shadcn) con lo que eventualmente será lógica de negocio de dominio. Sin separación semántica, escalar la app generaría confusión sobre dónde vive cada hook.

---

## Estado Previo

```
hooks/
  use-mobile.ts    ← primitivo shadcn
  use-toast.ts     ← primitivo shadcn
```

---

## Trabajo Realizado

### 1. Reorganización con `git mv` (historial preservado)

```bash
git mv hooks/use-mobile.ts hooks/ui/use-mobile.ts
git mv hooks/use-toast.ts  hooks/ui/use-toast.ts
```

Usar `git mv` (no `cp` + `rm`) preserva el historial de commits de ambos archivos.

### 2. Imports actualizados

| Archivo | Cambio |
|---|---|
| `components/ui/sidebar.tsx` | `@/hooks/use-mobile` → `@/hooks/ui/use-mobile` |
| `components/ui/toaster.tsx` | `@/hooks/use-toast` → `@/hooks/ui/use-toast` |

### 3. `hooks/domain/README.md` — Contrato de la convención

Documenta:
- Reglas de naming (`use-<recurso>.ts`)
- Dependencias permitidas (`lib/services/` o `lib/repositories/`)
- Prohibición de `useState` para datos remotos (siempre SWR)
- Patrón de inyección del token Clerk via `useAuth()`
- Hooks planificados para tickets futuros: `use-messages`, `use-projects`, `use-agents`

---

## Estructura Final

```
hooks/
  ui/
    use-mobile.ts    ← hooks de infraestructura UI (shadcn)
    use-toast.ts
  domain/
    README.md        ← convención documentada, listo para futuros hooks
```

---

## Resultados

### Tests

```
Test Suites: 7 passed, 7 total
Tests:       72 passed, 72 total
```

### Cobertura

```
All files  | 100% Stmts | 100% Branch | 100% Funcs | 100% Lines
```

### Build

```
✓ Compiled successfully in 1493.1ms
✓ Finished TypeScript in 3.6s
✓ Generating static pages (7/7)
```

---

## Criterios de Aceptación — Verificación

| Criterio | Estado |
|---|---|
| `hooks/ui/` contiene exclusivamente hooks de infraestructura/primitivos | ✅ |
| `hooks/domain/` tiene convención documentada, lista para hooks de negocio | ✅ |
| Ningún import roto tras la reorganización | ✅ |
| `pnpm test --coverage` mantiene 100% | ✅ |
| Build sin errores | ✅ |

---

## Impacto en Tickets Siguientes

Los hooks de dominio (`use-messages`, `use-projects`, `use-agents`) se crearán en `hooks/domain/` consumiendo los servicios de TICKET-FE-TD-001. El README.md ya documenta el patrón exacto a seguir.
