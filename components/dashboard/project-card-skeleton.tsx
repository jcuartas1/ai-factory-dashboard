'use client';

/**
 * ProjectCardSkeleton — components/dashboard/project-card-skeleton.tsx
 *
 * Placeholder de carga usando animate-pulse bg-muted.
 * "use client" — aunque no tiene hooks, es un componente de hoja
 * que puede ser compuesto en contextos cliente.
 */

export function ProjectCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-xl bg-card border border-border"
      aria-hidden="true"
    >
      {/* Título */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="w-4 h-4 rounded-md bg-muted animate-pulse shrink-0 mt-0.5" />
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
