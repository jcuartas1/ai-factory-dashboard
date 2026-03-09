import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  // fallbackRedirectUrl: si no hay redirect previo, manda al dashboard principal
  // forceRedirectUrl no se usa aquí — queremos respetar redirects previos (ej. deep links)
  return <SignIn fallbackRedirectUrl="/projects" />
}
