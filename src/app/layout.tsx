import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: side-effect import of global CSS may not have module declarations in this TS setup
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'
import { getCurrentYear } from '@/lib/year'
import Toaster from '@/components/Toaster'
import CookieBanner from '@/components/CookieBanner'
import { Analytics } from '@vercel/analytics/react' // <-- Importamos las analíticas de Vercel
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamenook.es'),
  title: {
    default:  'GameNook — Reseñas de Videojuegos',
    template: '%s — GameNook',
  },
  description: 'Descubre, reseña y comparte tus videojuegos favoritos con la comunidad gamer.',
  openGraph: {
    title: 'GameNook — Reseñas de Videojuegos',
    description: 'Descubre, reseña y comparte tus videojuegos favoritos con la comunidad gamer.',
    url: 'https://www.gamenook.es',
    siteName: 'GameNook',
    locale:   'es_ES',
    type:     'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }], 
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const year = getCurrentYear()

  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>

          <footer className="bg-gn-bg border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto py-8 px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="text-center md:text-left">
                  <p className="text-gn-text text-sm">
                    © {year}{' '}
                    <span className="font-bold text-gn-primary">GameNook</span>
                  </p>
                  <p className="text-gn-muted text-xs mt-1">
                    Hecho por gamers, para gamers
                  </p>
                </div>

                {/* ── Enlaces legales ── */}
                <nav className="flex items-center gap-4 text-xs text-gn-muted">
                  <a href="/legal/aviso-legal" className="hover:text-gn-text transition-colors">
                    Aviso legal
                  </a>
                  <span className="text-white/[0.08]">·</span>
                  <a href="/legal/privacidad" className="hover:text-gn-text transition-colors">
                    Privacidad
                  </a>
                  <span className="text-white/[0.08]">·</span>
                  <a href="/legal/cookies" className="hover:text-gn-text transition-colors">
                    Cookies
                  </a>
                </nav>

              </div>
            </div>
          </footer>
          <Toaster />
        </Providers>

        {/* Banner de cookies — fuera de Providers para evitar flash en SSR */}
        <CookieBanner />
        
        {/* Vercel Analytics tracking script */}
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  )
}