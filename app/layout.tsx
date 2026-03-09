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
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#a88d47',
          colorBackground: '#141414',
          colorInputBackground: '#0a0a0a',
          colorText: 'white',
        },
        elements: {
          rootBox: { fontFamily: 'var(--font-geist-sans)' },
          card: { fontFamily: 'var(--font-geist-sans)' },
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
