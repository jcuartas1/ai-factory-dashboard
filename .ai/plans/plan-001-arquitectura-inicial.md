# PLAN-001: Análisis de Arquitectura Inicial — AI Software Factory

**Ticket origen:** TICKET-FE-001  
**Fecha:** 9 de marzo de 2026  
**Autor:** @aifactory-dev  
**Estado:** Diagnóstico completado — pendiente de implementación

---

## 1. Stack Instalado vs Stack Requerido

| Tecnología | Requerido | Instalado | Estado |
|---|---|---|---|
| Next.js 15 (App Router) | 15.x | **16.1.6** | ⚠️ Versión adelantada (verificar estabilidad) |
| React 19 | 19.x | 19.2.4 | ✅ |
| Tailwind CSS v4 | v4 sin config.js | v4 via `@import 'tailwindcss'` | ✅ |
| shadcn/ui New York | New York | New York | ✅ |
| Framer Motion | Requerido | **No instalado** | ❌ |
| `@clerk/nextjs` | Requerido | **No instalado** | ❌ |
| SWR o React Query | Requerido | **No instalado** | ❌ |
| `@vercel/analytics` | Recomendado | 1.6.1 | ✅ |

---

## 2. Mapa de la Aplicación Actual

### 2.1 Rutas (App Router)

```
app/
├── layout.tsx         → RootLayout (RSC) — HTML shell global
├── globals.css        → Design tokens + Tailwind v4
└── page.tsx           → / (RSC) — única página real
```

**Problema crítico:** No existen route groups ni rutas anidadas. Los 4 items de navegación de la sidebar (`/projects`, `/agents`, `/analytics`, `/settings`) son `#hash` anchors, no rutas reales de Next.js. La aplicación está en scaffolding inicial.

### 2.2 Árbol de Componentes

```
RootLayout (RSC)
└── page.tsx (RSC)
    └── DashboardLayout [use client] ← ⚠️
        ├── Sidebar [use client]
        └── Topbar [use client]
            └── Avatar (shadcn/ui)
```

### 2.3 Componentes Personalizados

| Componente | Directiva | Responsabilidad | Problemas |
|---|---|---|---|
| `components/dashboard/layout.tsx` | `"use client"` | Shell del dashboard: posiciona Sidebar + Topbar + main | No debería ser client; tiene placeholder `border-dashed` de dev |
| `components/dashboard/sidebar.tsx` | `"use client"` | Navegación lateral fija, org switcher | `activeItem` via `useState` en lugar de `usePathname()`; links son `#hash` |
| `components/dashboard/topbar.tsx` | `"use client"` | Breadcrumb + notificaciones + avatar | Sin lógica real de notificaciones; avatar hardcodeado a `github.com/shadcn.png` |
| `components/theme-provider.tsx` | `"use client"` | Wrapper de `next-themes` | **No se usa en ningún lado** |

### 2.4 UI Kit (shadcn/ui)

Se han instalado **50+ componentes** de shadcn/ui. Todos viven en `components/ui/`. Representan la totalidad del kit disponible. Ninguno ha sido personalizado o extendido para el dominio de la aplicación todavía.

---

## 3. Configuración y Design Tokens

### 3.1 globals.css — Lo que funciona bien ✅

- Variables CSS de diseño completamente definidas y alineadas con el design system:
  - `--background: #0a0a0a`, `--card: #141414`, `--primary: #a88d47`, `--border: #2a2a2a`
- Bloque `@theme inline` correcto para Tailwind v4 (sin `tailwind.config.js`)
- Fuentes registradas: `Playfair Display` (serif / títulos) y `Geist` (sans / UI)
- Modo oscuro forzado via `className="dark"` en `<html>` — correcto para la estrategia de dark-only

### 3.2 Problemas en globals.css ⚠️

- Existe un segundo archivo `styles/globals.css` con variables `oklch` generadas por v0.dev que **no se usa** pero genera confusión. Debe eliminarse.

---

## 4. Problemas Identificados (Priorizados)

### P0 — Críticos / Bloquean features reales

| ID | Problema | Archivo | Impacto |
|---|---|---|---|
| P0-01 | Sin routing real — todos los links son `#hash` | `components/dashboard/sidebar.tsx` | No se puede navegar entre secciones |
| P0-02 | Framer Motion no instalado | `package.json` | Sin animaciones (requerido en stack) |
| P0-03 | Clerk no instalado | `package.json` | Sin autenticación |
| P0-04 | SWR / React Query no instalado | `package.json` | Sin data fetching del flujo asíncrono AI |

### P1 — Importantes / Afectan calidad del código

| ID | Problema | Archivo | Impacto |
|---|---|---|---|
| P1-01 | `DashboardLayout` es `"use client"` innecesariamente | `components/dashboard/layout.tsx` | Toda la shell se hidrata en cliente; máximo RSC no cumplido |
| P1-02 | `activeItem` hardcodeado con `useState` | `components/dashboard/sidebar.tsx` | Estado de navegación no refleja la URL real; se pierde al refrescar |
| P1-03 | Fuentes cargadas doblemente | `app/layout.tsx` + `globals.css` | `next/font` instancia las fuentes (`_geist`) pero no aplica `.variable`; además se carga Google Fonts via CSS `@import`. Doble carga innecesaria |
| P1-04 | `typescript.ignoreBuildErrors: true` | `next.config.mjs` | Build de producción ignora errores TS — peligroso |
| P1-05 | Main content con placeholder de dev | `components/dashboard/layout.tsx` | `border-dashed` + texto "Main Content Area" es temporal |

### P2 — Menores / Deuda técnica

| ID | Problema | Archivo | Impacto |
|---|---|---|---|
| P2-01 | `ThemeProvider` instalado pero sin usar | `components/theme-provider.tsx` | Dead code; pero `next-themes` sí está en deps |
| P2-02 | Metadata con datos de v0.dev | `app/layout.tsx` | `title: 'v0 App'`, `generator: 'v0.app'` — no actualizado |
| P2-03 | `styles/globals.css` duplicado con oklch | `styles/globals.css` | Archivo huérfano de la generación de v0.dev |
| P2-04 | Hooks duplicados | `hooks/` vs `components/ui/` | `use-mobile.ts` y `use-toast.ts` existen en ambos lugares |
| P2-05 | Avatar hardcodeado | `components/dashboard/topbar.tsx` | `src="github.com/shadcn.png"` — sin integración con Clerk user |
| P2-06 | `images.unoptimized: true` | `next.config.mjs` | Desactiva el CDN de imágenes de Vercel |

---

## 5. Lo que Funciona Bien ✅

1. **Design system sólido**: Las variables CSS están bien definidas, son consistentes y alineadas al brief (negro profundo, dorado premium, glassmorphism base con `backdrop-blur` en topbar).
2. **Tailwind v4 correctamente configurado**: `@theme inline` en lugar de `tailwind.config.js`, uso de variables CSS nativas.
3. **shadcn/ui completo**: Todo el kit de componentes está disponible para usar inmediatamente.
4. **Dark mode forzado**: Estrategia de `className="dark"` en `<html>` es la correcta para una app dark-only; no hay flicker de tema.
5. **`suppressHydrationWarning`** en `<body>`: Correctamente aplicado.
6. **Tipografía registrada**: Playfair Display y Geist mapeadas como `font-serif` y `font-sans`.
7. **Estructura de carpetas**: `app/`, `components/`, `lib/`, `hooks/` bien separadas.
8. **`@vercel/analytics`**: Integrado desde inicio.

---

## 6. Plan de Acción — Próximos Pasos

### Sprint 1 — Base técnica (deuda P0 + P1)

- [ ] **Instalar dependencias faltantes**: `framer-motion`, `@clerk/nextjs`, `swr`
- [ ] **Crear route groups**: `app/(dashboard)/layout.tsx` con el DashboardLayout como RSC real
- [ ] **Crear rutas reales**: `/projects`, `/agents`, `/analytics`, `/settings`
- [ ] **Refactorizar Sidebar**: Usar `usePathname()` para `activeItem` en lugar de `useState`; cambiar links de `#hash` a rutas `/`
- [ ] **Separar `DashboardLayout`**: Convertir el shell a RSC; sólo `Sidebar` y `Topbar` necesitan `"use client"`
- [ ] **Resolver doble carga de fuentes**: Eliminar el `@import url(Google Fonts)` de globals.css y usar sólo `next/font`, aplicando `.variable` correctamente en `<html>`
- [ ] **Limpiar `next.config.mjs`**: Eliminar `typescript.ignoreBuildErrors` y `images.unoptimized`

### Sprint 2 — Autenticación + Data Layer

- [ ] **Integrar Clerk**: `ClerkProvider` en `RootLayout`, middleware de protección de rutas, `currentUser()` en RSC
- [ ] **Conectar avatar a Clerk**: `useUser()` en Topbar para imagen y nombre real
- [ ] **Implementar SWR**: Hook base `useProjects()` con polling para respuestas asíncronas de IA

### Sprint 3 — Features de Dominio

- [ ] **Página `/projects`**: Listado de proyectos con cards (shadcn/ui `Card`)
- [ ] **Flujo de creación de proyecto**: Dialog → POST → polling SWR → estado "en proceso" → completado
- [ ] **Página `/agents`**: Chat interface con el flujo asíncrono AI (POST 201 → poll GET)
- [ ] **Animaciones Framer Motion**: Page transitions, sidebar item hover, card entrance

### Sprint 4 — Pulido

- [ ] Eliminar `styles/globals.css` (archivo huérfano)
- [ ] Eliminar `components/theme-provider.tsx` o integrarlo si se necesita
- [ ] Actualizar metadata en `app/layout.tsx`
- [ ] Resolver duplicación de hooks

---

## 7. Estructura de Destino (Target Architecture)

```
app/
├── layout.tsx                    → RootLayout (RSC) — ClerkProvider aquí
├── globals.css                   → Design tokens
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
└── (dashboard)/
    ├── layout.tsx                → DashboardLayout (RSC) — shell
    ├── projects/
    │   └── page.tsx              → RSC — lista proyectos
    ├── agents/
    │   └── page.tsx              → RSC + client chat component
    ├── analytics/
    │   └── page.tsx
    └── settings/
        └── page.tsx

components/
├── dashboard/
│   ├── sidebar.tsx               → "use client" (usePathname)
│   ├── topbar.tsx                → "use client" (useUser Clerk)
│   └── nav-item.tsx              → "use client" (leaf component)
├── projects/
│   ├── project-card.tsx
│   ├── project-list.tsx
│   └── create-project-dialog.tsx → "use client"
├── agents/
│   ├── chat-panel.tsx            → "use client"
│   └── message-bubble.tsx
└── ui/                           → shadcn/ui sin modificar

hooks/
├── use-projects.ts               → SWR hook con polling
├── use-agents.ts
└── use-mobile.ts

lib/
├── utils.ts
└── api.ts                        → fetch helpers tipados
```

---

*Documento generado automáticamente por @aifactory-dev el 9 de marzo de 2026.*
