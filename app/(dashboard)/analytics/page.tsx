export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Métricas de uso, rendimiento de agentes y actividad de despliegues.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Las métricas aparecerán aquí.</p>
      </div>
    </div>
  );
}
