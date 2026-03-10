'use client';

/**
 * ProjectsGrid — components/dashboard/projects-grid.tsx
 *
 * Componente cliente que orquesta el fetching SWR y renderiza la grilla
 * de proyectos con animaciones de cascada (Framer Motion staggerChildren).
 *
 * "use client" requerido: usa hooks SWR + Framer Motion.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useProjects } from '@/lib/repositories/projects.repository';
import { ProjectCard } from '@/components/dashboard/project-card';
import { ProjectCardSkeleton } from '@/components/dashboard/project-card-skeleton';

// ─── Variantes de animación ───────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="
        col-span-full flex flex-col items-center justify-center gap-5
        rounded-xl border border-dashed border-border
        bg-card/50 px-8 py-20 text-center
      "
    >
      <LayoutGrid
        className="w-14 h-14 text-border"
        strokeWidth={1}
        aria-hidden="true"
      />
      <div className="space-y-2 max-w-xs">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Sin proyectos aún
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Crea tu primer proyecto y la IA comenzará a generar el código por ti.
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

interface ProjectsGridProps {
  tenantId: string | null;
}

export function ProjectsGrid({ tenantId }: ProjectsGridProps) {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    getToken().then((t) => {
      setToken(t);
      setTokenReady(true);
    });
  }, [getToken]);

  const { data: projects, isLoading, error } = useProjects(tenantId, token);

  const loading = !tokenReady || isLoading;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center space-y-2">
        <p className="text-sm font-medium text-destructive">
          Error al cargar los proyectos
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <p className="text-xs text-muted-foreground">
          tenantId: <span className="font-mono">{tenantId ?? 'null'}</span>
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading ? (
        // Skeleton: 6 placeholders mientras carga
        Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))
      ) : projects && projects.length > 0 ? (
        projects.map((project) => (
          <motion.div key={project.projectId} variants={itemVariants}>
            <ProjectCard project={project} />
          </motion.div>
        ))
      ) : (
        <EmptyState />
      )}
    </motion.div>
  );
}
