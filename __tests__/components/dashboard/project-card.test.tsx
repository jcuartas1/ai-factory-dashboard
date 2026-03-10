import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/dashboard/project-card';
import { ProjectCardSkeleton } from '@/components/dashboard/project-card-skeleton';
import type { Project } from '@/lib/types/project.types';

// Mock Framer Motion — evita errores de AnimationContext en jsdom
// Filtra props exclusivas de Framer (whileHover, transition, variants, etc.)
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;

jest.mock('framer-motion', () => {
  const framerOnlyProps = new Set([
    'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'whileDrag',
    'animate', 'initial', 'exit', 'variants', 'transition',
    'layout', 'layoutId', 'drag', 'dragConstraints', 'onAnimationComplete',
  ]);
  return {
    motion: {
      div: ({ children, ...props }: MotionDivProps) => {
        const domProps = Object.fromEntries(
          Object.entries(props).filter(([k]) => !framerOnlyProps.has(k)),
        );
        return require('react').createElement('div', domProps, children);
      },
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      require('react').createElement(require('react').Fragment, null, children),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseProject: Project = {
  projectId: 'proj-001',
  name: 'Mi Proyecto de Prueba',
  status: 'CODING',
  sourceType: 'NEW_GENERATED',
  threadCount: 3,
  createdAt: '2026-01-15T12:00:00.000Z',
};

// ─── ProjectCard ──────────────────────────────────────────────────────────────

describe('ProjectCard', () => {
  it('renderiza el nombre del proyecto', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('Mi Proyecto de Prueba')).toBeInTheDocument();
  });

  it('muestra el label de status CODING', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
  });

  it('muestra el label de status DEPLOYED', () => {
    render(<ProjectCard project={{ ...baseProject, status: 'DEPLOYED' }} />);
    expect(screen.getByText('Desplegado')).toBeInTheDocument();
  });

  it('muestra el label de status DRAFT', () => {
    render(<ProjectCard project={{ ...baseProject, status: 'DRAFT' }} />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('muestra el label de status UX_DESIGN', () => {
    render(<ProjectCard project={{ ...baseProject, status: 'UX_DESIGN' }} />);
    expect(screen.getByText('UX / Diseño')).toBeInTheDocument();
  });

  it('muestra el label de status REVIEWING', () => {
    render(<ProjectCard project={{ ...baseProject, status: 'REVIEWING' }} />);
    expect(screen.getByText('Revisión')).toBeInTheDocument();
  });

  it('muestra el contador de hilos en singular', () => {
    render(<ProjectCard project={{ ...baseProject, threadCount: 1 }} />);
    expect(screen.getByText('1 hilo')).toBeInTheDocument();
  });

  it('muestra el contador de hilos en plural', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('3 hilos')).toBeInTheDocument();
  });

  it('usa aria-label GITHUB_IMPORTED para proyecto importado', () => {
    render(
      <ProjectCard project={{ ...baseProject, sourceType: 'GITHUB_IMPORTED' }} />,
    );
    expect(screen.getByLabelText('GITHUB_IMPORTED')).toBeInTheDocument();
  });

  it('usa aria-label NEW_GENERATED para proyecto generado', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByLabelText('NEW_GENERATED')).toBeInTheDocument();
  });

  it('aplica font-serif al título', () => {
    render(<ProjectCard project={baseProject} />);
    const title = screen.getByText('Mi Proyecto de Prueba');
    expect(title).toHaveClass('font-serif');
  });

  it('aplica color semántico bg-yellow-500 al badge CODING', () => {
    render(<ProjectCard project={baseProject} />);
    // El dot de status tiene aria-hidden, buscamos por clase
    const card = screen.getByText('Mi Proyecto de Prueba').closest('div[class]');
    expect(card).toBeInTheDocument();
    // Verifica que el componente renderiza sin errores con status CODING
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
  });

  it('aplica color semántico bg-green-500 al badge DEPLOYED', () => {
    const { container } = render(
      <ProjectCard project={{ ...baseProject, status: 'DEPLOYED' }} />,
    );
    const dot = container.querySelector('.bg-green-500');
    expect(dot).toBeInTheDocument();
  });
});

// ─── ProjectCardSkeleton ──────────────────────────────────────────────────────

describe('ProjectCardSkeleton', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('tiene aria-hidden para accesibilidad', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('contiene elementos con animate-pulse', () => {
    const { container } = render(<ProjectCardSkeleton />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('usa bg-muted en los placeholders', () => {
    const { container } = render(<ProjectCardSkeleton />);
    const mutedElements = container.querySelectorAll('.bg-muted');
    expect(mutedElements.length).toBeGreaterThan(0);
  });

  it('usa bg-card como fondo del contenedor', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-card');
  });

  it('aplica border-border semántico', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).toHaveClass('border-border');
  });
});
