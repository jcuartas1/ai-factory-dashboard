## TICKET-FE-003: Integración de Identidad (Clerk), Rutas Protegidas y UI de Login Premium

## Contexto
Con el enrutamiento core completado (TICKET-FE-002), el dashboard es accesible públicamente. Necesitamos integrar @clerk/nextjs para proteger la aplicación. Además, dado el posicionamiento "Luxury/Enterprise" de nuestro SaaS, la experiencia de autenticación no puede delegarse a un portal genérico. Debemos incrustar y estilizar fuertemente los componentes de Clerk en nuestras propias rutas /sign-in y /sign-up.

## Tareas para @aifactory-dev
[ ] Aislamiento: Crea la rama feat/ticket-fe-003-clerk-auth partiendo de main.

[ ] Configuración Global y Theming: Envuelve la app con <ClerkProvider> en app/layout.tsx. Es CRÍTICO que utilices la propiedad appearance de Clerk para inyectar nuestro Design System globalmente:
- Importa dark de @clerk/themes y úsalo como baseTheme.
- Sobrescribe variables: colorPrimary: '#a88d47', colorBackground: '#141414', colorInputBackground: '#0a0a0a', colorText: 'white'.
- Sobrescribe elements: Fuerza las tipografías (usa var(--font-geist-sans) para el cuerpo).

[ ] Protección de Rutas (Middleware): Crea src/middleware.ts en la raíz del proyecto. Configura clerkMiddleware(). El Route Group (dashboard) debe estar estrictamente protegido. Las rutas /sign-in y /sign-up deben ser públicas.

[ ] Diseño del Layout de Auth Premium: Crea el Route Group app/(auth)/layout.tsx.
- Debe ser un RSC puro.
- Diseño: Fondo min-h-screen bg-[#0a0a0a] flex items-center justify-center.
- Agrega un elemento decorativo de fondo: un pequeño gradiente radial desenfocado (blur-3xl) con nuestro color dorado (#a88d47) al 10% de opacidad para dar un toque "Luxury".

[ ] Páginas de Login/Registro:
- Crea app/(auth)/sign-in/[[...sign-in]]/page.tsx e incrusta el componente <SignIn /> de Clerk.
- Crea app/(auth)/sign-up/[[...sign-up]]/page.tsx e incrusta el componente <SignUp /> de Clerk.

[ ] Refactor del Topbar: Edita components/dashboard/topbar.tsx.
- Elimina el avatar hardcodeado (github.com/shadcn.png).
- Reemplázalo por <UserButton /> de Clerk.

[ ] Actualización de Tests (Jest): Configura los mocks necesarios en jest.setup.ts para que <ClerkProvider> y <UserButton /> no rompan los tests del Topbar y del Layout. Meta: Mantener 100% de cobertura en el dominio propio.

## Criterios de Aceptación
[ ] Al navegar a /projects sin sesión, redirecciona automáticamente a /sign-in.
[ ] La página de /sign-in muestra la tarjeta de Clerk integrada de forma nativa en nuestro ecosistema oscuro (Dark Mode, acentos dorados, sin fondos blancos que rompan la vista).
[ ] El archivo middleware.ts está activo y configurado.
[ ] Los tests unitarios pasan al 100% integrando los mocks de Clerk.