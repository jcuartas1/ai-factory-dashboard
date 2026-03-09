import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardLayout } from '@/components/dashboard/layout';

// Mock Sidebar para aislar el DashboardLayout
jest.mock('@/components/dashboard/sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar Mock</nav>,
}));

// Mock Topbar para aislar el DashboardLayout
jest.mock('@/components/dashboard/topbar', () => ({
  Topbar: ({ title }: { title?: string }) => (
    <header data-testid="topbar">{title ?? 'Topbar Mock'}</header>
  ),
}));

describe('DashboardLayout (components/dashboard/layout)', () => {
  it('renderiza el Sidebar', () => {
    render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renderiza el Topbar', () => {
    render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    expect(screen.getByTestId('topbar')).toBeInTheDocument();
  });

  it('inyecta children en el main', () => {
    render(
      <DashboardLayout>
        <p data-testid="child-content">Hello World</p>
      </DashboardLayout>
    );

    const child = screen.getByTestId('child-content');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Hello World');
  });

  it('pasa el title al Topbar', () => {
    render(
      <DashboardLayout title="Proyectos">
        <p>Content</p>
      </DashboardLayout>
    );

    expect(screen.getByTestId('topbar')).toHaveTextContent('Proyectos');
  });

  it('renderiza múltiples children correctamente', () => {
    render(
      <DashboardLayout>
        <p data-testid="child-1">Uno</p>
        <p data-testid="child-2">Dos</p>
        <p data-testid="child-3">Tres</p>
      </DashboardLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('el contenedor principal tiene la clase de fondo correcto', () => {
    const { container } = render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen', 'bg-[#0a0a0a]');
  });

  it('el main tiene las clases de layout correctas', () => {
    const { container } = render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('ml-64', 'mt-16', 'p-8');
  });

  it('NO contiene el placeholder de dev border-dashed', () => {
    const { container } = render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    const dashed = container.querySelector('.border-dashed');
    expect(dashed).not.toBeInTheDocument();
  });

  it('NO contiene el texto de placeholder "Main Content Area"', () => {
    render(
      <DashboardLayout>
        <p>Content</p>
      </DashboardLayout>
    );

    expect(screen.queryByText('Main Content Area')).not.toBeInTheDocument();
  });
});
