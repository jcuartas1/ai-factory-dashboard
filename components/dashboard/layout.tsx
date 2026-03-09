import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function DashboardLayout({
  children,
  title,
  breadcrumb,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Topbar title={title} breadcrumb={breadcrumb} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
}

