'use client';

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

      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-8">
        <div className="min-h-[calc(100vh-200px)] rounded-lg border-2 border-dashed border-[#2a2a2a] p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-6 rounded-lg bg-[#141414] border border-[#2a2a2a] mb-4">
              <p className="text-[#808080] text-sm font-medium">Main Content Area</p>
            </div>
            {children ? (
              children
            ) : (
              <p className="text-[#666666] text-sm max-w-md">
                Content will be rendered here. Replace this placeholder with your dashboard content.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
