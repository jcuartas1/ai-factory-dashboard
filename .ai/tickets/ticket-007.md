## TICKET-FE-007 (Refactorizado): Módulo Tenants y UI de Onboarding

## Contexto
Gracias a la resolución proactiva del ticket en esta ubicacion .ai/resolve/ticket-td-001-lib-services-layer.md, ya contamos con un cliente HTTP robusto (lib/http/client.ts) y una arquitectura orientada a servicios. Ahora necesitamos consumir el endpoint POST /tenants detallado en la guía del backend (v1.0) para aprovisionar la organización del usuario recién registrado. Para ello, extenderemos la capa lib/ y construiremos la vista de /onboarding.

## Tareas para @aifactory-dev
[ ] Aislamiento: Crea la rama feat/ticket-fe-007-onboarding partiendo de main.

[ ] Configuración de Clerk: En .env.local, actualiza NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding, leer el documento guia del backend .ai/plans/FRONTEND_INTEGRATION_GUIDE.md

[ ] Extensión del Dominio (Tenants):
- Crea lib/types/tenant.types.ts. Define las interfaces basadas en la guía del backend: Tenant (id, name, status, createdAt), CreateTenantDto (name). Define el enum TenantStatus.
- Crea lib/services/tenants.service.ts. Debe exportar funciones puras (ej. createTenant(dto, token)) que utilicen el lib/http/client.ts existente para hacer el POST /tenants.

[ ] Vista de Onboarding (app/(dashboard)/onboarding/page.tsx):
- Crea la página como "use client".
- UI Premium: Fondo oscuro (#0a0a0a), formulario minimalista centrado solicitando el "Nombre de tu Empresa". Botón principal en dorado (#a88d47).
- Lógica:
1. Usa useAuth().getToken() para obtener el JWT.
2. Al hacer submit, llama a createTenant({ name }, token).
3. Maneja estados de carga (isSubmitting).
4. Captura errores (usando la clase HttpError implementada previamente) y muestra el mensaje.
5. Si es exitoso, usa useRouter().push('/projects').

[ ] Testing:
- Escribe tests unitarios para tenants.service.ts simulando el lib/http/client.ts y asegurando el 100% de cobertura en esa capa.

Criterios de Aceptación
[ ] El módulo tenants sigue exactamente el mismo patrón arquitectónico que projects y messages.
[ ] Ningún componente hace fetch directamente; la vista de onboarding consume tenants.service.ts.
[ ] Al registrarse, el usuario es forzado a pasar por /onboarding antes de ver el dashboard.
[ ] La suite de tests pasa al 100% manteniendo la calidad del dominio lib/.