# TICKET-FE-TD-002 — Cierre y Resolución
## Refactor — Centralizar Design Tokens en Variables CSS

---

## Información del Ticket

| Campo | Valor |
|---|---|
| **ID** | TICKET-FE-TD-002 |
| **Tipo** | Deuda Técnica — Design System |
| **Estado** | ✅ Done |
| **Prioridad** | 🟡 Media |
| **Componente** | Frontend — Design System / CSS |
| **Asignado a** | @aifactory-dev |
| **Reporter** | @juliancuartas |
| **Detectado en** | Auditoría post TICKET-FE-003 |
| **Rama sugerida** | `refactor/ticket-fe-td-002-design-tokens` |
| **Fecha de apertura** | 9 de marzo de 2026 |
| **Fecha de cierre** | 9 de marzo de 2026 |
| **Epic** | AI Software Factory — Frontend Core |

---

## Descripción Original

Los colores del Design System estaban hardcodeados como strings literales en cada componente, violando **Single Source of Truth**. Cambiar el acento dorado `#a88d47` requería editar decenas de archivos manualmente.

---

## Estado Previo

9 valores HEX repetidos inline en `sidebar.tsx`, `topbar.tsx`, `layout.tsx`, `(auth)/layout.tsx` y todas las pages del dashboard:

```
#0a0a0a  #141414  #a88d47  #2a2a2a
#e5e5e5  #808080  #b0b0b0  #1a1a1a  #666666
```

---

## Decisión de Implementación

El proyecto ya contaba con un sistema de variables CSS shadcn (`--background`, `--card`, `--primary`, etc.) mapeadas a utilidades Tailwind vía `@theme inline`. En lugar de crear variables paralelas como `--color-bg-base`, se optó por:

1. **Reusar el sistema existente** — evitar duplicación de tokens.
2. **Añadir solo los 3 tokens faltantes** que no tenían equivalente semántico.
3. **Migrar todo el código a clases Tailwind semánticas** — más legibles, más mantenibles.

---

## Trabajo Realizado

### 1. `app/globals.css` — 3 tokens nuevos

Añadidos en `:root`, `.dark` y `@theme inline`:

```css
--subtle:    #b0b0b0;   /* texto terciario / hover states */
--separator: #666666;   /* divisores y separadores */
--elevated:  #222222;   /* backgrounds hover elevados */
```

### 2. Mapeo de hexadecimales a clases semánticas

| Hex hardcodeado | Clase Tailwind semántica |
|---|---|
| `bg-[#0a0a0a]` | `bg-background` |
| `bg-[#141414]` | `bg-card` |
| `border-[#2a2a2a]` | `border-border` |
| `bg-[#1a1a1a]` | `bg-input` |
| `bg-[#222222]` | `bg-elevated` |
| `text-[#a88d47]` / `bg-[#a88d47]` | `text-primary` / `bg-primary` |
| `text-[#e5e5e5]` | `text-foreground` |
| `text-[#808080]` | `text-muted-foreground` |
| `text-[#b0b0b0]` | `text-subtle` |
| `text-[#666666]` | `text-separator` |

### 3. Archivos refactorizados

- `components/dashboard/sidebar.tsx`
- `components/dashboard/topbar.tsx`
- `components/dashboard/layout.tsx`
- `app/(auth)/layout.tsx`
- `app/(dashboard)/agents/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/projects/page.tsx`
- `app/(dashboard)/settings/page.tsx`

### 4. Tests actualizados

Las aserciones que verificaban clases HEX directas se migraron a clases semánticas:

- `text-[#a88d47]` → `text-primary`
- `bg-[#0a0a0a]` → `bg-background`
- `text-[#e5e5e5]` → `text-foreground`

Archivos actualizados:
- `__tests__/components/dashboard/sidebar.test.tsx`
- `__tests__/components/dashboard/topbar.test.tsx`
- `__tests__/components/dashboard/layout.test.tsx`

---

## Resultados Finales

### Tests

```
Test Suites: 7 passed, 7 total
Tests:       72 passed, 72 total
Time:        3.464s
```

### Cobertura

```
All files  | 100% Stmts | 100% Branch | 100% Funcs | 100% Lines
```

### Build

```
✓ Compiled successfully in 3.0s
✓ Finished TypeScript in 3.8s
✓ Generating static pages (7/7)
```

---

## Criterios de Aceptación — Verificación

| Criterio | Estado |
|---|---|
| Cero HEX hardcodeados fuera de `globals.css` en código fuente | ✅ |
| Cambiar `--primary` en un solo lugar actualiza el acento en toda la app | ✅ |
| `pnpm test --coverage` mantiene 100% | ✅ |
| Build de producción sin errores | ✅ |
