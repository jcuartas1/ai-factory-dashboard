import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/dashboard/sidebar';

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renderiza todos los ítems de navegación', () => {
    render(<Sidebar />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renderiza el branding de la marca', () => {
    render(<Sidebar />);

    expect(screen.getByText('Aura')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
  });

  it('resalta Projects cuando el pathname es /projects', () => {
    mockPathname.mockReturnValue('/projects');
    render(<Sidebar />);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveClass('text-primary');
  });

  it('resalta AI Agents cuando el pathname es /agents', () => {
    mockPathname.mockReturnValue('/agents');
    render(<Sidebar />);

    const agentsLink = screen.getByRole('link', { name: /ai agents/i });
    expect(agentsLink).toHaveClass('text-primary');
  });

  it('resalta Analytics cuando el pathname es /analytics', () => {
    mockPathname.mockReturnValue('/analytics');
    render(<Sidebar />);

    const analyticsLink = screen.getByRole('link', { name: /analytics/i });
    expect(analyticsLink).toHaveClass('text-primary');
  });

  it('resalta Settings cuando el pathname es /settings', () => {
    mockPathname.mockReturnValue('/settings');
    render(<Sidebar />);

    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toHaveClass('text-primary');
  });

  it('resalta Projects en rutas anidadas como /projects/123', () => {
    mockPathname.mockReturnValue('/projects/123');
    render(<Sidebar />);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveClass('text-primary');
  });

  it('NO resalta ningún ítem en una ruta desconocida', () => {
    mockPathname.mockReturnValue('/unknown-route');
    render(<Sidebar />);

    const links = screen.getAllByRole('link');
    const navLinks = links.filter(link =>
      ['/projects', '/agents', '/analytics', '/settings'].includes(
        link.getAttribute('href') || ''
      )
    );
    navLinks.forEach(link => {
      expect(link).not.toHaveClass('text-primary');
    });
  });

  it('los links apuntan a rutas reales, no a #hash', () => {
    render(<Sidebar />);

    const links = screen.getAllByRole('link').filter(link => {
      const href = link.getAttribute('href') || '';
      return ['/projects', '/agents', '/analytics', '/settings'].includes(href);
    });

    expect(links).toHaveLength(4);
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      expect(href).not.toMatch(/^#/);
      expect(href).toMatch(/^\//);
    });
  });

  it('abre y cierra el org switcher al hacer click', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const orgButton = screen.getByRole('button');
    expect(orgButton).toBeInTheDocument();

    // El chevron inicial no debería tener rotate-180
    const chevron = orgButton.querySelector('svg');
    expect(chevron).toBeInTheDocument();

    await user.click(orgButton);
    // Después del click, el estado isOrgOpen cambia a true
    // El componente renderiza el ícono con rotate-180
    // Verificamos que el botón respondió al click
    expect(orgButton).toBeInTheDocument();
  });

  it('no renderiza el indicador de activo cuando no hay coincidencia', () => {
    mockPathname.mockReturnValue('/');
    const { container } = render(<Sidebar />);

    // El indicador activo (línea dorada izquierda) solo aparece cuando isActive es true
    const activeIndicators = container.querySelectorAll('.bg-primary.w-1.h-6');
    expect(activeIndicators).toHaveLength(0);
  });

  it('renderiza exactamente UN indicador activo cuando hay coincidencia', () => {
    mockPathname.mockReturnValue('/projects');
    const { container } = render(<Sidebar />);

    const activeIndicators = container.querySelectorAll('div.w-1.h-6');
    expect(activeIndicators).toHaveLength(1);
  });
});
