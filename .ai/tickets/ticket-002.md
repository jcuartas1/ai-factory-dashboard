## TICKET-FE-002: Ejecución Sprint 1 — Base Técnica y Enrutamiento Core

## Contexto
Basado en el diagnóstico .ai/plans/plan-001-arquitectura-inicial.md, nuestra arquitectura base (scaffolding generado por v0) tiene deuda técnica crítica. El layout principal está renderizándose enteramente en el cliente, la navegación usa anclas (#hash) en lugar de rutas reales, y faltan dependencias clave de nuestro stack estricto. Este ticket resuelve la deuda P0 y P1 para dejar el terreno listo para la capa de datos (Clerk/SWR).

## Tareas para @aifactory-dev
[ ] Aislamiento: Crea la rama core/ticket-fe-002-sprint1-base partiendo de main.

[ ] Dependencias (P0-02, P0-03, P0-04): Instala vía pnpm las librerías obligatorias: framer-motion, @clerk/nextjs, y swr.

[ ] Limpieza de Configuración (P1-04, P2-06): Edita next.config.mjs. Elimina las directivas typescript.ignoreBuildErrors: true y images.unoptimized: true para recuperar la seguridad de tipos y la optimización de Vercel.

[ ] Corrección de Tipografías (P1-03): - Elimina cualquier @import de Google Fonts en app/globals.css.
- En app/layout.tsx, configura Playfair_Display y Geist usando next/font/google. Exporta sus variables (ej. --font-playfair) y aplícalas al className del <body>.

[ ] Refactor de Enrutamiento y Layout (P0-01, P1-01):
- Crea la estructura de carpetas: app/(dashboard)/layout.tsx y app/(dashboard)/projects/page.tsx (página temporal con un "Hola Mundo" para probar).
- Refactoriza el Layout del Dashboard: Debe ser un React Server Component (RSC) (elimina "use client"). Solo debe importar e inyectar el Sidebar y el Topbar.
- Refactoriza components/dashboard/sidebar.tsx: Mantén "use client". Sustituye el uso de useState para el activeItem por el hook usePathname() de next/navigation. Cambia todos los links de #hash a sus rutas reales (ej. /projects, /agents).

[ ] QA y Cobertura (100%):

Escribe tests unitarios para los nuevos Casos de Uso, asegurando que el flujo de creación atómica (Proyecto + Hilo) funcione.

Criterios de Aceptación
[ ] El comando pnpm dev levanta sin advertencias de fuentes bloqueantes en Turbopack.
[ ] Al navegar a http://localhost:3000/projects, el Sidebar resalta automáticamente el ítem "Proyectos" leyendo la URL real, no un estado temporal.
[ ] El archivo app/(dashboard)/layout.tsx no contiene la directiva "use client".
[ ] El archivo next.config.mjs está limpio de ignoradores de errores.
[ ] Cobertura de tests al 100% y cero deudas técnicas introducidas.