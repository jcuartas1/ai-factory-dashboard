'use client';

import { LayoutGrid, Zap, BarChart3, Settings, ChevronDown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { TenantStatus } from '@/lib/types/tenant.types';

const navigationItems = [
  {
    name: 'Projects',
    href: '/projects',
    icon: LayoutGrid,
  },
  {
    name: 'AI Agents',
    href: '/agents',
    icon: Zap,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  tenantName?: string;
  tenantStatus?: TenantStatus;
}

export function Sidebar({ tenantName, tenantStatus }: SidebarProps) {
  const pathname = usePathname();
  const [isOrgOpen, setIsOrgOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-card border-r border-border z-50">
      {/* Brand */}
      <div className="p-8 border-b border-border">
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          <span className="text-primary">Aura</span> Dev
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Premium Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-input text-primary'
                  : 'text-subtle hover:text-foreground hover:bg-input'
              }`}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Organization Switcher */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setIsOrgOpen(!isOrgOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-input hover:bg-elevated transition-colors duration-200 text-subtle hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {tenantName ? tenantName.slice(0, 2).toUpperCase() : '—'}
              </span>
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-medium truncate">{tenantName ?? 'Organización'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {tenantStatus === 'PENDING_PAYMENT' && (
                  <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
                )}
                <p className={`text-xs truncate ${
                  tenantStatus === 'ACTIVE' ? 'text-green-500' :
                  tenantStatus === 'SUSPENDED' ? 'text-destructive' :
                  'text-yellow-500'
                }`}>
                  {tenantStatus === 'ACTIVE' ? 'Activo' :
                   tenantStatus === 'SUSPENDED' ? 'Suspendido' :
                   tenantStatus === 'PENDING_PAYMENT' ? 'Pago pendiente' : '—'}
                </p>
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isOrgOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
