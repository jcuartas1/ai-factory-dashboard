// Declaraciones de tipo para importaciones de side-effect de CSS
// Necesario para que TypeScript no reporte TS2882 en `import './globals.css'`
declare module '*.css' {}
