## TICKET-FE-TD-003: Reorganizar `hooks/` — Separar UI de Dominio

**Tipo:** Deuda Técnica — Arquitectura  
**Prioridad:** 🟡 Baja  
**Detectado en:** Auditoría post TICKET-FE-003  
**Rama sugerida:** `refactor/ticket-fe-td-003-hooks-structure`

---

## Contexto

La carpeta `hooks/` mezcla hooks de infraestructura UI (primitivos de shadcn) con lo que eventualmente será la lógica de negocio del dominio. A medida que escale la app, esto generará confusión sobre dónde vive la lógica de estado de negocio.

## Problema actual

```
hooks/
  use-mobile.ts    ← hook de shadcn — infraestructura UI
  use-toast.ts     ← hook de shadcn — infraestructura UI
```

Cuando se implementen `useProjects`, `useAgents`, `useMessages` (con SWR/React Query), quedarán mezclados con primitivos de UI sin distinción semántica.

## Estructura objetivo

```
hooks/
  ui/
    use-mobile.ts    ← hooks de shadcn/primitivos UI
    use-toast.ts
  domain/
    use-projects.ts  ← lógica de negocio con SWR
    use-agents.ts
    use-messages.ts  ← incluye polling para respuestas IA
```

## Tareas

- [ ] Crear `hooks/ui/` y mover `use-mobile.ts` y `use-toast.ts`
- [ ] Actualizar todos los imports en `components/` y `app/`
- [ ] Actualizar `jest.config.ts` si hay paths de cobertura afectados
- [ ] Crear `hooks/domain/` vacío con un `README.md` que documente la convención
- [ ] `pnpm test --coverage` sin regresiones

## Nota de coordinación

Este ticket debe ejecutarse **después de TICKET-FE-TD-001** (capa de servicios), ya que los hooks de dominio consumirán los servicios creados en ese ticket.

## Criterios de Aceptación

- [ ] `hooks/ui/` contiene exclusivamente hooks de infraestructura/primitivos
- [ ] `hooks/domain/` contiene exclusivamente hooks con lógica de negocio
- [ ] Ningún import roto tras la reorganización
- [ ] `pnpm test --coverage` mantiene 100%
