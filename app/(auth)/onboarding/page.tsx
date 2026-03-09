'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createTenant, getMyTenants } from '@/lib/services/tenants.service';
import { HttpError } from '@/lib/http/client';

// ─── Fases de la pantalla ────────────────────────────────────────────────────
type Phase = 'checking' | 'ready' | 'error';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1200;

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [phase, setPhase] = useState<Phase>('checking');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Verificación / polling del webhook ─────────────────────────────────
  const checkUser = useCallback(
    async (retriesLeft: number) => {
      try {
        const token = await getToken();
        const tenants = await getMyTenants({ token });

        if (tenants.length > 0) {
          // Usuario ya tiene tenant → va directo al dashboard
          router.replace('/projects');
          return;
        }

        // Usuario existe en BD pero sin tenant → mostrar formulario
        setPhase('ready');
      } catch (err) {
        if (err instanceof HttpError) {
          // Sesión inválida → volver al login
          if (err.status === 401 || err.status === 403) {
            router.replace('/sign-in');
            return;
          }
        }

        // Cualquier otro error: webhook aún no procesado, reintentar
        if (retriesLeft > 0) {
          setTimeout(() => checkUser(retriesLeft - 1), RETRY_DELAY_MS);
        } else {
          // Agotados los intentos → mostrar error explícito
          setPhase('error');
        }
      }
    },
    [getToken, router],
  );

  useEffect(() => {
    checkUser(MAX_RETRIES);
  }, [checkUser]);

  // ─── Submit del formulario ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = await getToken();
      await createTenant({ name: name.trim() }, { token });
      router.push('/projects');
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 403) {
          setFormError('Tu cuenta no tiene permisos para crear una organización.');
        } else if (err.status === 400) {
          setFormError('El nombre de la organización no es válido.');
        } else {
          setFormError('Error del servidor. Intenta de nuevo en unos momentos.');
        }
      } else {
        setFormError('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Fase: verificando (spinner) ────────────────────────────────────────
  if (phase === 'checking') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-label="Verificando tu cuenta…"
        />
        <p className="text-sm text-muted-foreground">Preparando tu cuenta…</p>
      </div>
    );
  }

  // ─── Fase: error de sincronización ──────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="w-full max-w-md px-6 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Algo salió mal
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No pudimos conectar con nuestros servidores. Verifica tu conexión e intenta de nuevo.
          </p>
        </div>
        <button
          onClick={() => {
            setPhase('checking');
            checkUser(MAX_RETRIES);
          }}
          className="
            rounded-lg px-6 py-3 text-sm font-semibold
            bg-primary text-primary-foreground
            hover:brightness-110 active:scale-[0.98] transition-all duration-200
          "
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ─── Fase: ready — formulario de creación de tenant ─────────────────────
  return (
    <div className="w-full max-w-md px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
          Bienvenido a AI Factory
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Antes de comenzar, crea tu organización. Podrás invitar
          colaboradores y gestionar proyectos desde allí.
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-xl border border-border bg-card p-8"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="org-name"
              className="block text-sm font-medium text-subtle"
            >
              Nombre de tu empresa u organización
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Acme Corp, Mi Startup SAS…"
              maxLength={100}
              required
              disabled={isSubmitting}
              className="
                w-full rounded-lg border border-border bg-background px-4 py-3
                text-sm text-foreground placeholder:text-muted-foreground
                outline-none transition-all duration-200
                focus:border-primary focus:ring-2 focus:ring-primary/20
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="
              w-full rounded-lg px-4 py-3 text-sm font-semibold
              transition-all duration-200
              bg-primary text-primary-foreground
              hover:brightness-110 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
            "
          >
            {isSubmitting ? 'Creando organización…' : 'Continuar'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Podrás cambiar el nombre de tu organización en cualquier momento desde Configuración.
      </p>
    </div>
  );
}
