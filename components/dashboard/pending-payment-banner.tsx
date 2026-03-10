'use client';

/**
 * PendingPaymentBanner — components/dashboard/pending-payment-banner.tsx
 *
 * Banner de alerta visible cuando el tenant está en PENDING_PAYMENT.
 * El CTA muestra un toast "Próximamente" — el flujo de pago real es futuro.
 */

import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { TenantStatus } from '@/lib/types/tenant.types';

interface PendingPaymentBannerProps {
  status: TenantStatus;
}

export function PendingPaymentBanner({ status }: PendingPaymentBannerProps) {
  if (status !== 'PENDING_PAYMENT') return null;

  function handleActivate() {
    toast.info('Próximamente', {
      description: 'El flujo de pago estará disponible en la siguiente versión.',
    });
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
      <AlertTriangle
        className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Tu organización está pendiente de activación
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Para crear proyectos necesitas activar tu plan. Esto toma menos de 2 minutos.
        </p>
      </div>
      <button
        onClick={handleActivate}
        className="
          shrink-0 rounded-lg px-4 py-2 text-xs font-semibold
          bg-yellow-500 text-background
          hover:brightness-110 active:scale-[0.98] transition-all duration-200
        "
      >
        Activar plan
      </button>
    </div>
  );
}
