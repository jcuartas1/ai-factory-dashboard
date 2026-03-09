## TICKET-FE-TD-002: Centralizar Design Tokens en Variables CSS

**Tipo:** Deuda Técnica — Design System  
**Prioridad:** 🟡 Media  
**Detectado en:** Auditoría post TICKET-FE-003  
**Rama sugerida:** `refactor/ticket-fe-td-002-design-tokens`

---

## Contexto

Los colores, espaciados y valores del Design System están hardcodeados como strings literales en **cada componente**, violando el principio de **Single Source of Truth**.

## Problema actual

Los siguientes valores aparecen repetidos en `topbar.tsx`, `sidebar.tsx`, `layout.tsx`, `(dashboard)/layout.tsx`, todas las pages, y el `(auth)/layout.tsx`:

```
#0a0a0a   ← fondo base
#141414   ← fondo de cards/panels
#a88d47   ← acento dorado premium
#2a2a2a   ← color de bordes
#e5e5e5   ← texto primario
#808080   ← texto secundario
#b0b0b0   ← texto terciario/hover
#1a1a1a   ← fondo de inputs
#666666   ← separadores
```

Si el cliente pide cambiar el dorado `#a88d47` a otro tono, hay que editar decenas de archivos manualmente.

## Estructura objetivo

Definir todos los tokens en `app/globals.css` como variables CSS nativas (compatible con Tailwind v4):

```css
/* app/globals.css */
@layer base {
  :root {
    --color-bg-base:       #0a0a0a;
    --color-bg-panel:      #141414;
    --color-bg-input:      #1a1a1a;
    --color-accent:        #a88d47;
    --color-border:        #2a2a2a;
    --color-text-primary:  #e5e5e5;
    --color-text-secondary:#808080;
    --color-text-tertiary: #b0b0b0;
    --color-text-muted:    #666666;
  }
}
```

Y referenciarlos en los componentes como `bg-[var(--color-bg-base)]`.

## Tareas

- [ ] Definir todos los tokens en `app/globals.css`
- [ ] Reemplazar todos los valores hardcodeados en `components/dashboard/`
- [ ] Reemplazar en `app/(auth)/layout.tsx`, `app/(dashboard)/` pages
- [ ] Verificar que el Design System visual no cambia (screenshot testing o revisión manual)
- [ ] `pnpm test --coverage` mantiene 100%

## Criterios de Aceptación

- [ ] Cero ocurrencias de `#0a0a0a`, `#141414`, `#a88d47`, `#2a2a2a` hardcodeadas fuera de `globals.css`
- [ ] Cambiar `--color-accent` en un solo lugar actualiza el acento en toda la app
