## TICKET-FE-008: Projects Grid UI, SWR Integración y Resolución de Deuda Técnica (Design Tokens)

## Contexto

El flujo de Onboarding está completado. Ahora construiremos la vista de /projects recuperando la lista de proyectos reales vía SWR.
🚨 ALERTA ARQUITECTÓNICA CRÍTICA: Queda estrictamente prohibido el uso de valores hexadecimales arbitrarios en Tailwind (ej. bg-[#141414], text-[#a88d47]). Resolveremos el TICKET-FE-TD-002 ahora mismo: toda la UI debe usar exclusivamente clases semánticas (bg-card, bg-background, text-primary, border-border) ancladas a nuestras variables CSS de globals.css para garantizar soporte futuro para Light Mode.

Tareas para @aifactory-dev
[ ] Aislamiento: Crea la rama feat/ticket-fe-008-projects-grid.

[ ] Refactor Design Tokens (Fix TD-002):
- Audita rápidamente Sidebar, Topbar, Onboarding y Layout. Reemplaza cualquier clase arbitraria como bg-[#0a0a0a] por bg-background, bg-[#141414] por bg-card, y el dorado por text-primary o bg-primary.

[ ] Hooks SWR (lib/repositories/projects.repository.ts):
- Implementa useProjects(tenantId, token) consumiendo projects.service.getProjects.
- Implementa useMyTenants(token) consumiendo tenants.service.getMyTenants.

[ ] Componente UI — ProjectCard ("use client"):
- Props: Recibe Project (desde lib/types/project.types.ts).
- Diseño Base Semántico: Usa bg-card, border-border, p-6, rounded-xl.
- Hover (Framer Motion): Al hacer hover, eleva sutilmente (y: -4) e ilumina el borde (border-primary).
- Contenido: Título (font-serif), icono de lucide-react dinámico según sourceType, indicador de status (círculo de color dinámico usando clases semánticas como bg-green-500 para DEPLOYED, bg-yellow-500 para CODING), y contador threadCount.

[ ] Estados de UI:
- ProjectCardSkeleton: Componente de carga usando animate-pulse bg-muted.
- Empty State: Si projects.length === 0, muestra un panel border-dashed border-border, icono gigante y texto invitando a crear un proyecto.

[ ] Vista Principal (app/(dashboard)/projects/page.tsx):
- Obtiene token (Clerk) y tenantId (del primer tenant del array useMyTenants).
- Envuelve la grilla (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6) en un contenedor framer-motion con staggerChildren para que las ProjectCard entren en cascada fluida.

Criterios de Aceptación
[ ] Cero uso de bg-[#hex], border-[#hex] o text-[#hex] en todo el proyecto. Todo usa tokens de shadcn/Tailwind.
[ ] La vista hace fetch real al backend en el puerto 3002 mediante SWR.
[ ] El Skeleton y el Empty State funcionan y respetan el sistema de diseño.
[ ] Las animaciones de cascada se ejecutan a 60fps.
[ ] Los tests unitarios de los componentes de UI alcanzan la cobertura requerida.