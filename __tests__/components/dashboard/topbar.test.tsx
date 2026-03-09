import React from 'react';
import { render, screen } from '@testing-library/react';
import { Topbar } from '@/components/dashboard/topbar';

// Mock @clerk/nextjs para aislar el Topbar (UserButton)
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
}));

describe('Topbar', () => {
  it('renderiza el título por defecto "Dashboard" cuando no se pasa title', () => {
    render(<Topbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renderiza el title personalizado cuando se proporciona', () => {
    render(<Topbar title="Proyectos" />);
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
  });

  it('renderiza el breadcrumb cuando se proporciona', () => {
    render(
      <Topbar
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Proyectos' },
        ]}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
  });

  it('renderiza el separador "/" entre ítems de breadcrumb', () => {
    render(
      <Topbar
        breadcrumb={[
          { label: 'Inicio', href: '/' },
          { label: 'Agentes' },
        ]}
      />
    );

    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('NO renderiza separador en el primer ítem del breadcrumb', () => {
    render(
      <Topbar
        breadcrumb={[{ label: 'Dashboard', href: '/' }]}
      />
    );

    // Con solo 1 ítem, no debe haber separador "/"
    const separators = screen.queryAllByText('/');
    expect(separators).toHaveLength(0);
  });

  it('renderiza el botón de notificaciones', () => {
    render(<Topbar />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('tiene el texto accesible "Notifications" en el botón de campana', () => {
    render(<Topbar />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renderiza el botón de perfil del usuario (UserButton de Clerk)', () => {
    render(<Topbar />);
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('el header tiene la clase de glassmorphism backdrop-blur', () => {
    const { container } = render(<Topbar />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain('backdrop-blur');
  });

  it('el breadcrumb usa hrefs correctos en los links', () => {
    render(
      <Topbar
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
        ]}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/dashboard');
    expect(links[1]).toHaveAttribute('href', '/settings');
  });

  it('el último ítem del breadcrumb tiene estilo "activo"', () => {
    const { container } = render(
      <Topbar
        breadcrumb={[
          { label: 'Root', href: '/' },
          { label: 'Último' },
        ]}
      />
    );

    const links = container.querySelectorAll('a');
    const lastLink = links[links.length - 1];
    expect(lastLink.className).toContain('text-foreground');
  });
});
