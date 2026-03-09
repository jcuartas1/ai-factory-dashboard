import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  // forceRedirectUrl: Clerk v7 — ignora cualquier redirect_url en query params
  // y siempre manda a /onboarding tras el registro.
  return <SignUp forceRedirectUrl="/onboarding" />
}
