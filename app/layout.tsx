import type { Metadata, Viewport } from 'next'
import { GeistPixelGrid } from 'geist/font/pixel'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'Fidele | AI-Powered Health Assistant & Symptom Triage',
  description:
    'Fidele is a clinical-grade AI health assistant that triages symptoms, assess health risks, recommends care specialties, and routes to nearest validated clinics using geolocation mapping. HIPAA compliant and encrypted by default.',
  keywords: [
    'symptom checker',
    'AI health assistant',
    'clinical triage tool',
    'medical routing',
    'find hospitals near me',
    'HIPAA health vault',
    'vitals logger',
  ],
  authors: [{ name: 'FIDELE' }],
  creator: 'Fidele Health Corp.',
  publisher: 'Fidele Health Corp.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Fidele | AI-Powered Health Assistant & Symptom Triage',
    description:
      'Clinical-grade AI health assistant that triages symptoms, assess health risks, recommends care specialties, and routes to nearest validated clinics using geolocation mapping.',
    siteName: 'Fidele Health Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fidele Health Assistant',
    description:
      'Clinical-grade AI health assistant that triages symptoms, assess health risks, recommends care specialties, and routes to nearest validated clinics using geolocation mapping.',
    creator: '@fidelehealth',
  },
  category: 'healthcare',
}

export const viewport: Viewport = {
  themeColor: '#F2F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistPixelGrid.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
