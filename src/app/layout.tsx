import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'
import { Orbitron, Rajdhani } from 'next/font/google'

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
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
            <footer className="bg-black border-t border-red-700">
              <div className="max-w-4xl mx-auto py-6 px-4 text-center">
                <span className="text-gray-400">© 2026 <span className="text-red-600 font-bold">GameNook</span>. Todos los derechos reservados.</span>
              </div>
            </footer>
        </Providers>
      </body>
    </html>
  )
}