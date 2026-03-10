'use client';

/**
 * ProjectCard — components/dashboard/project-card.tsx
 *
 * Tarjeta visual para un proyecto individual.
 * "use client" requerido por Framer Motion (whileHover).
 */

import { motion } from 'framer-motion';
import { Github, Cpu, MessageSquare, Clock } from 'lucide-react';
import type { Project, ProjectStatus } from '@/lib/types/project.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<
  ProjectStatus,
  { label: string; colorClass: string }
> = {
  DRAFT:     { label: 'Borrador',    colorClass: 'bg-muted-foreground' },
  UX_DESIGN: { label: 'UX / Diseño', colorClass: 'bg-purple-500' },
  CODING:    { label: 'Desarrollo',  colorClass: 'bg-yellow-500' },
  REVIEWING: { label: 'Revisión',    colorClass: 'bg-blue-500' },
  DEPLOYED:  { label: 'Desplegado',  colorClass: 'bg-green-500' },
};

function SourceIcon({ sourceType }: { sourceType: Project['sourceType'] }) {
  if (sourceType === 'GITHUB_IMPORTED') {
    return <Github className="w-4 h-4 text-muted-foreground" />;
  }
  return <Cpu className="w-4 h-4 text-muted-foreground" />;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

// ─── Componente ──────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { label, colorClass } = statusConfig[project.status];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="
        group relative flex flex-col gap-5 p-6 rounded-xl
        bg-card border border-border hover:border-primary
        transition-colors duration-200 cursor-pointer
        shadow-[0_4px_24px_rgba(0,0,0,0.35)]
      "
    >
      {/* Header: título + icono de fuente */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-foreground leading-tight line-clamp-2">
          {project.name}
        </h3>
        <span className="shrink-0 mt-0.5" aria-label={project.sourceType}>
          <SourceIcon sourceType={project.sourceType} />
        </span>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${colorClass}`}
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-subtle">{label}</span>
      </div>

      {/* Footer: hilos y fecha */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            {project.threadCount}{' '}
            {project.threadCount === 1 ? 'hilo' : 'hilos'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
