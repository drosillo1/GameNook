import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'
import { Orbitron, Rajdhani } from 'next/font/google'
import { getCurrentYear } from '@/lib/year'
import Toaster from '@/components/Toaster'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-display', weight: ['400','700','900'] })
const rajdhani = Rajdhani({ subsets: ['latin'], variable: '--font-body', weight: ['400','500','600'] })

export const metadata: Metadata = {
  title: 'GameNook - Reseñas de Videojuegos',
  description: 'Descubre, reseña y comparte tus videojuegos favoritos con la comunidad',
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
                    © {year} <span className="font-bold text-gn-primary">GameNook</span>
                  </p>
                  <p className="text-gn-muted text-xs mt-1">
                    Todos los derechos reservados
                  </p>
                </div>
                <div className="flex items-center gap-6 text-xs text-gn-muted">
                  <span>Hecho por gamers, para gamers</span>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}