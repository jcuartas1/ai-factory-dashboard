import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getMyTenants } from '@/lib/services/tenants.service';
import { HttpError } from '@/lib/http/client';

/**
 * Página raíz — actúa como router inteligente.
 * Clerk puede aterrizar aquí en varios escenarios (SSO de usuario existente,
 * redirect_url no configurada, etc.). En vez de asumir destino, verifica
 * el estado real del usuario y redirige al lugar correcto.
 */
export default async function Home() {
  const { userId, getToken } = await auth();

  // Sin sesión → login
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const token = await getToken();
    const tenants = await getMyTenants({ token });

    // Usuario con tenant → dashboard
    if (tenants.length > 0) {
      redirect('/projects');
    }

    // Usuario autenticado pero sin tenant → onboarding
    redirect('/onboarding');
  } catch (err) {
    if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
      redirect('/sign-in');
    }
    // Backend no ha procesado el webhook aún → onboarding (tiene polling)
    redirect('/onboarding');
  }
}

