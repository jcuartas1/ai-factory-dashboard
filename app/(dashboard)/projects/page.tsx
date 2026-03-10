import { auth } from '@clerk/nextjs/server';
import { getMyTenants } from '@/lib/services/tenants.service';
import { ProjectsGrid } from '@/components/dashboard/projects-grid';
import { PendingPaymentBanner } from '@/components/dashboard/pending-payment-banner';

/**
 * ProjectsPage — RSC
 *
 * Resuelve tenantId en el servidor (el layout ya verificó que existe).
 * El token lo obtiene el cliente directamente via useAuth() para evitar
 * que Clerk invalide un token server-side serializado como prop.
 */
export default async function ProjectsPage() {
  const { getToken } = await auth();
  const token = await getToken();

  // Reutilizamos el mismo call que ya hizo el layout — Next.js deduplica el fetch
  const tenants = await getMyTenants({ token });
  const tenant = tenants[0];
  const tenantId = tenant?.tenantId ?? null;
  const tenantStatus = tenant?.tenantStatus ?? null;

  return (
    <div className="space-y-8">
      {/* Banner de pago pendiente */}
      {tenantStatus && <PendingPaymentBanner status={tenantStatus} />}

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
          Proyectos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestiona y despliega tus proyectos generados con IA.
        </p>
      </div>

      {/* Grid cliente con SWR + Framer Motion */}
      <ProjectsGrid tenantId={tenantId} />
    </div>
  );
}
