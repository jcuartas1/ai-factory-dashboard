# Plan de Ejecución — TICKET-FE-003
## Integración de Identidad (Clerk), Rutas Protegidas y UI de Login Premium

**Fecha:** 9 de marzo de 2026
**Rama objetivo:** `feat/ticket-fe-003-clerk-auth`
**Agente:** `@aifactory-dev`
**Estado:** Pendiente de aprobación

---

## 1. Auditoría del Estado Actual

### Dependencias

| Paquete | Estado | Acción requerida |
|---|---|---|
| `@clerk/nextjs` v7.0.1 | ✅ Instalado | Ninguna |
| `@clerk/themes` | ❌ NO instalado | `pnpm add @clerk/themes` |
| `framer-motion` | ✅ Instalado | Ninguna |
| `swr` | ✅ Instalado | Ninguna |

### Variables de Entorno

| Archivo | Estado | Acción requerida |
|---|---|---|
| `.env.local` | ❌ NO existe | Crear con placeholders documentados |

> ⚠️ **BLOQUEANTE:** Sin `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`, la app falla en runtime y en build.

### Archivos del Proyecto

| Archivo | Estado | Acción requerida |
|---|---|---|
| `middleware.ts` (raíz) | ❌ NO existe | Crear |
| `app/(auth)/layout.tsx` | ❌ NO existe | Crear |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | ❌ NO existe | Crear |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | ❌ NO existe | Crear |
| `app/layout.tsx` | ✅ Existe | Modificar — agregar `ClerkProvider` |
| `components/dashboard/topbar.tsx` | ✅ Existe | Modificar — reemplazar Avatar por `UserButton` |
| `jest.setup.ts` | ✅ Existe (solo 2 líneas) | Modificar — agregar mocks de Clerk |
| `__tests__/components/dashboard/topbar.test.tsx` | ✅ Existe | Modificar — adaptar tests al nuevo `UserButton` |

### Discrepancias detectadas respecto al Ticket

| Discrepancia | Detalle | Resolución |
|---|---|---|
| Ticket menciona `src/middleware.ts` | El proyecto NO tiene carpeta `src/`. La estructura es App Router en raíz | Crear `middleware.ts` en la **raíz del proyecto** |
| `@clerk/themes` no mencionado en dependencias del ticket | Es requerido implícitamente por la instrucción `import dark from '@clerk/themes'` | Instalar como dependencia de producción |

---

## 2. Pasos de Ejecución

### Paso 1 — Rama Git
```
git checkout -b feat/ticket-fe-003-clerk-auth
```

### Paso 2 — Instalar dependencia faltante
```
pnpm add @clerk/themes
```

### Paso 3 — Crear `.env.local`
Archivo con placeholders documentados. **Este archivo está en `.gitignore`** — no se comitea.

```env
# Clerk Authentication
# Obtener en: https://dashboard.clerk.com → Tu App → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REEMPLAZAR_CON_TU_CLAVE
CLERK_SECRET_KEY=sk_test_REEMPLAZAR_CON_TU_CLAVE

# Rutas de redirección post-auth
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/projects
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/projects
```

### Paso 4 — `app/layout.tsx` — Envolver con `<ClerkProvider>`

Modificar para importar `ClerkProvider` de `@clerk/nextjs` y `dark` de `@clerk/themes`.

**Appearance config a inyectar:**
```tsx
appearance={{
  baseTheme: dark,
  variables: {
    colorPrimary: '#a88d47',
    colorBackground: '#141414',
    colorInputBackground: '#0a0a0a',
    colorText: 'white',
  },
  elements: {
    rootBox: { fontFamily: 'var(--font-geist-sans)' },
    card: { fontFamily: 'var(--font-geist-sans)' },
  },
}}
```

### Paso 5 — `middleware.ts` en la raíz del proyecto

Usar `clerkMiddleware` y `createRouteMatcher` de `@clerk/nextjs/server`.

**Lógica de protección:**
- Rutas públicas: `/`, `/sign-in(.*)`, `/sign-up(.*)`
- Todo lo demás (incluyendo el route group `(dashboard)`) → protegido, redirige a `/sign-in`

> ⚠️ **Ajuste crítico Clerk v7+:** `auth` es una **función** que retorna una `Promise`. El callback debe ser `async` para poder `await`arla antes de llamar a `.protect()`.

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // auth() retorna Promise en Clerk v7 — se await-a antes de llamar protect()
    ;(await auth()).protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Paso 6 — `app/(auth)/layout.tsx` — RSC puro

**Diseño:**
- `min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden`
- Elemento decorativo absoluto: `div` con `w-96 h-96 bg-[#a88d47]/10 blur-3xl rounded-full` centrado en el fondo para el efecto *Luxury glow*

```tsx
// RSC — sin "use client"
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Decorative golden glow */}
      <div
        aria-hidden="true"
        className="absolute w-[500px] h-[500px] rounded-full bg-[#a88d47]/10 blur-3xl pointer-events-none"
      />
      <div className="relative z-10">
        {children}
      </div>
    </main>
  )
}
```

### Paso 7 — `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

### Paso 8 — `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```

### Paso 9 — `components/dashboard/topbar.tsx` — Refactor

**Cambios:**
- Eliminar: import `Avatar`, `AvatarImage`, `AvatarFallback` de `@/components/ui/avatar`
- Eliminar: import `User` de `lucide-react` (no se estaba usando activamente)
- Agregar: import `UserButton` de `@clerk/nextjs`
- Reemplazar el bloque `<Avatar>` por `<UserButton afterSignOutUrl="/" />`

**Appearance del `UserButton`** alineada al DS:
```tsx
<UserButton
  afterSignOutUrl="/"
  appearance={{
    elements: {
      avatarBox: 'w-9 h-9 hover:ring-2 hover:ring-[#a88d47] transition-all duration-200',
    },
  }}
/>
```

### Paso 10 — `jest.setup.ts` — Mocks de Clerk

Agregar mocks globales para evitar que `@clerk/nextjs` intente conectarse a Clerk durante tests:

```ts
// Mock @clerk/nextjs
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div data-testid="user-button" />,
  SignIn: () => <div data-testid="sign-in" />,
  SignUp: () => <div data-testid="sign-up" />,
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: { fullName: 'Test User' } }),
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}))
```

### Paso 11 — `__tests__/components/dashboard/topbar.test.tsx` — Refactor de Tests

**Tests a modificar:**
- `'renderiza el avatar del usuario'` → cambiar `getByTestId('avatar')` por `getByTestId('user-button')`
- `'el header tiene la clase de glassmorphism backdrop-blur'` → sin cambios, sigue válido

**Tests a eliminar:**
- Los que referencian `data-testid="avatar-image"` o hardcodean `src="https://github.com/shadcn.png"` (si existen)

**Mock a agregar** al inicio del test file:
```tsx
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
}))
```

> 📌 El mock en `jest.setup.ts` es global, pero declararlo también aquí **junto al mock de Avatar** existente mejora la legibilidad y el aislamiento del test.

---

## 3. Archivos Afectados — Resumen Final

| Archivo | Operación | Tipo |
|---|---|---|
| `.env.local` | CREAR | Config (no comiteado) |
| `middleware.ts` | CREAR | Nuevo archivo |
| `app/(auth)/layout.tsx` | CREAR | RSC |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | CREAR | RSC |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | CREAR | RSC |
| `app/layout.tsx` | MODIFICAR | RSC |
| `components/dashboard/topbar.tsx` | MODIFICAR | Client Component |
| `jest.setup.ts` | MODIFICAR | Test config |
| `__tests__/components/dashboard/topbar.test.tsx` | MODIFICAR | Tests |

---

## 4. Criterios de Aceptación verificables

- [ ] `GET /projects` sin sesión → redirige a `/sign-in`
- [ ] `/sign-in` muestra tarjeta Clerk sobre fondo `#0a0a0a` con acento dorado y sin fondos blancos
- [ ] `middleware.ts` activo en la raíz
- [ ] `pnpm test` pasa al 100% sin errores relacionados a Clerk
- [ ] `pnpm build` completa sin errores de TypeScript

---

## 5. Orden de ejecución recomendado

```
1. git checkout -b feat/ticket-fe-003-clerk-auth
2. pnpm add @clerk/themes
3. Crear .env.local
4. Crear middleware.ts
5. Modificar app/layout.tsx
6. Crear app/(auth)/layout.tsx
7. Crear sign-in/page.tsx y sign-up/page.tsx
8. Modificar topbar.tsx
9. Modificar jest.setup.ts
10. Modificar topbar.test.tsx
11. pnpm test → verificar 100%
12. git commit
```
