'use client';

import { Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface TopbarProps {
  title?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function Topbar({ title = 'Dashboard', breadcrumb }: TopbarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#2a2a2a] z-40">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left: Breadcrumb or Title */}
        <div className="flex items-center gap-2">
          {breadcrumb ? (
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-[#666666]">/</span>
                  )}
                  <a
                    href={item.href || '#'}
                    className={`transition-colors duration-200 ${
                      index === breadcrumb.length - 1
                        ? 'text-[#e5e5e5] font-medium'
                        : 'text-[#808080] hover:text-[#b0b0b0]'
                    }`}
                  >
                    {item.label}
                  </a>
                </div>
              ))}
            </nav>
          ) : (
            <h1 className="text-lg font-medium text-[#e5e5e5]">{title}</h1>
          )}
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-[#b0b0b0] hover:text-[#e5e5e5] transition-colors duration-200 group">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#a88d47] rounded-full" />
            <span className="sr-only">Notifications</span>
          </button>

          {/* User Profile — Clerk UserButton */}
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'w-9 h-9 hover:ring-2 hover:ring-[#a88d47] transition-all duration-200 rounded-full',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
