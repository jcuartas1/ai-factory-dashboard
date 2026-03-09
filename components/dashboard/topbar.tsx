'use client';

import { Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface TopbarProps {
  title?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function Topbar({ title = 'Dashboard', breadcrumb }: TopbarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left: Breadcrumb or Title */}
        <div className="flex items-center gap-2">
          {breadcrumb ? (
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-separator">/</span>
                  )}
                  <a
                    href={item.href || '#'}
                    className={`transition-colors duration-200 ${
                      index === breadcrumb.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-subtle'
                    }`}
                  >
                    {item.label}
                  </a>
                </div>
              ))}
            </nav>
          ) : (
            <h1 className="text-lg font-medium text-foreground">{title}</h1>
          )}
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-subtle hover:text-foreground transition-colors duration-200 group">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            <span className="sr-only">Notifications</span>
          </button>

          {/* User Profile — Clerk UserButton */}
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'w-9 h-9 hover:ring-2 hover:ring-primary transition-all duration-200 rounded-full',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
