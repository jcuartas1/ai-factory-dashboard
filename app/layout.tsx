import type { Metadata } from 'next'
import { Playfair_Display, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Software Factory',
  description: 'Plataforma SaaS B2B Premium para generación de software con IA',
  generator: 'aifactory-dev',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/onboarding"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#a88d47',
          colorBackground: '#141414',
          colorInputBackground: '#0a0a0a',
          colorText: 'white',
        },
        elements: {
          // Tipografía global
          rootBox: { fontFamily: 'var(--font-geist-sans)' },
          card: {
            fontFamily: 'var(--font-geist-sans)',
            backgroundColor: '#141414',
            border: '1px solid #2a2a2a',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          },
          // Textos del header de la card
          headerTitle: { color: '#e5e5e5' },
          headerSubtitle: { color: '#808080' },
          // Divider "or"
          dividerText: { color: '#666666' },
          dividerLine: { backgroundColor: '#2a2a2a' },
          // Labels de campos
          formFieldLabel: { color: '#b0b0b0' },
          formFieldInput: {
            backgroundColor: '#0a0a0a',
            borderColor: '#2a2a2a',
            color: '#e5e5e5',
          },
          // Footer "Don't have an account? Sign up"
          footerActionText: { color: '#808080' },
          footerActionLink: { color: '#a88d47' },
          // Botones sociales (Google)
          socialButtonsBlockButton: {
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#e5e5e5',
          },
          socialButtonsBlockButtonText: { color: '#e5e5e5' },
          // "Secured by Clerk"
          footer: { color: '#666666' },
          // Spinner / loader
          main: { color: '#e5e5e5' },

          // ── UserButton Popup ────────────────────────────────────────────
          userButtonPopoverCard: {
            backgroundColor: '#141414',
            border: '1px solid #2a2a2a',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          },
          userButtonPopoverMain: {
            backgroundColor: '#141414',
          },
          userButtonPopoverActions: {
            backgroundColor: '#141414',
          },
          userButtonPopoverActionButton: {
            color: '#e5e5e5',
            backgroundColor: 'transparent',
          },
          userButtonPopoverActionButton__manageAccount: {
            color: '#e5e5e5',
          },
          userButtonPopoverActionButton__signOut: {
            color: '#e5e5e5',
          },
          userButtonPopoverActionButtonText: {
            color: '#e5e5e5',
          },
          userButtonPopoverActionButtonIcon: {
            color: '#808080',
          },
          userButtonPopoverFooter: {
            backgroundColor: '#141414',
            borderColor: '#2a2a2a',
          },
          // Nombre y email en el header del popup
          userPreviewMainIdentifier: {
            color: '#e5e5e5',
          },
          userPreviewSecondaryIdentifier: {
            color: '#808080',
          },
          userPreviewAvatarBox: {
            width: '3rem',
            height: '3rem',
          },
        },
      }}
    >
      <html lang="es" className="dark">
        <body
          className={`${playfair.variable} ${geist.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
