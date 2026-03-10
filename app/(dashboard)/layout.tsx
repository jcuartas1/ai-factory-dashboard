import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { getMyTenants } from '@/lib/services/tenants.service';
import { HttpError } from '@/lib/http/client';

export default async function Layout({ children }: { children: ReactNode }) {
  const { userId, getToken } = await auth();

  // 1. Sin sesión activa de Clerk → login
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Con sesión válida → verificar si tiene tenant
  try {
    const token = await getToken();
    const tenants = await getMyTenants({ token });

    if (tenants.length === 0) {
      redirect('/onboarding');
    }

    const tenant = tenants[0];
    return (
      <DashboardLayout
        tenantName={tenant.tenantName}
        tenantStatus={tenant.tenantStatus}
      >
        {children}
      </DashboardLayout>
    );
  } catch (err) {
    if (err instanceof HttpError) {
      // 401/403 = sesión inválida o expirada → login
      if (err.status === 401 || err.status === 403) {
        redirect('/sign-in');
      }
      // Cualquier otro error HTTP (404 usuario nuevo, 500, etc.) → onboarding
      // El usuario existe en Clerk pero aún no tiene tenant registrado en el backend
      redirect('/onboarding');
    }
    // Error de red (backend caído) → onboarding también, es el camino más seguro
    redirect('/onboarding');
  }

  return <DashboardLayout>{children}</DashboardLayout>; // fallback: no debería llegar aquí
}
