'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { LogOut, Settings, Loader2, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SignOutState = 'idle' | 'loading' | 'error';

export function UserMenu() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signOutState, setSignOutState] = useState<SignOutState>('idle');

  async function handleSignOut() {
    setSignOutState('loading');
    try {
      await signOut({ redirectUrl: '/sign-in' });
    } catch {
      // El servidor de Clerk falló (500) — mostramos error con opción de reintentar
      setSignOutState('error');
    }
  }

  if (!user) return null;

  const displayName = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'Usuario';
  const initials = (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '');
  const avatarUrl = user.imageUrl;

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) setSignOutState('idle'); }}>
      <DropdownMenuTrigger asChild>
        <button
          className="
            relative w-9 h-9 rounded-full overflow-hidden
            ring-1 ring-border
            hover:ring-2 hover:ring-primary
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
          "
          aria-label="Menú de usuario"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary/20 text-primary text-xs font-semibold uppercase">
              {initials || displayName[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-card border-border"
      >
        {/* User info */}
        <DropdownMenuLabel className="pb-2">
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        {/* Settings */}
        <DropdownMenuItem
          className="text-subtle hover:text-foreground cursor-pointer gap-2"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {/* Sign out */}
        {signOutState === 'error' ? (
          <div className="px-2 py-2 space-y-2">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Error al cerrar sesión</span>
            </div>
            <button
              onClick={handleSignOut}
              className="
                w-full text-xs text-left px-2 py-1.5 rounded
                bg-destructive/10 text-destructive
                hover:bg-destructive/20 transition-colors duration-150
              "
            >
              Reintentar
            </button>
          </div>
        ) : (
          <DropdownMenuItem
            className="text-subtle hover:text-foreground cursor-pointer gap-2 focus:text-foreground"
            onClick={handleSignOut}
            disabled={signOutState === 'loading'}
          >
            {signOutState === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {signOutState === 'loading' ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
