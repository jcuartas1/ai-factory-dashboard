import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import type { TenantStatus } from '@/lib/types/tenant.types';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  tenantName?: string;
  tenantStatus?: TenantStatus;
}

export function DashboardLayout({
  children,
  title,
  breadcrumb,
  tenantName,
  tenantStatus,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar tenantName={tenantName} tenantStatus={tenantStatus} />
      <Topbar title={title} breadcrumb={breadcrumb} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
}

