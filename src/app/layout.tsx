import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  title: 'Zikafon — Trouve ta vibe musicale',
  description: 'Décris ton humeur, découvre 5 titres faits pour toi. Swipe, like, vibe.',
  keywords: ['musique', 'mood', 'deezer', 'découverte', 'playlist'],
  // src/app/icon.png is auto-detected by Next.js App Router as the browser favicon
  openGraph: {
    title: 'Zikafon — Trouve ta vibe musicale',
    description: 'Décris ton humeur, découvre 5 titres faits pour toi.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080614',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
