'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { GamepadIcon, ChevronDownIcon, ShieldIcon } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR'

  return (
    <header className="sticky top-0 z-50 bg-gn-bg/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gn-primary rounded-md flex items-center justify-center">
            <GamepadIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-black text-lg tracking-wide">
            <span className="text-gn-text">Game</span>
            <span className="text-gn-primary">Nook</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/games"
            className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
              pathname === '/games' ? 'text-gn-text' : 'text-gn-muted hover:text-gn-text'
            }`}
          >
            Juegos
          </Link>

          {session && (
            <>
              <Link
                href="/collection"
                className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
                  pathname === '/collection' ? 'text-gn-text' : 'text-gn-muted hover:text-gn-text'
                }`}
              >
                Colección
              </Link>

              <Link
                href="/games/add"
                className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
                  pathname === '/games/add' ? 'text-gn-text' : 'text-gn-muted hover:text-gn-text'
                }`}
              >
                Agregar
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 text-sm font-semibold uppercase
                          tracking-widest transition-colors duration-200 ${
                pathname === '/admin'
                  ? 'text-yellow-400'
                  : 'text-yellow-500/70 hover:text-yellow-400'
              }`}
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gn-card border border-white/[0.08]
                           rounded-lg px-3 py-1.5 hover:border-white/15 transition-colors"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gn-primary/20 flex items-center
                                  justify-center text-gn-primary text-xs font-bold">
                    {session.user?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-gn-text text-sm font-semibold hidden sm:block
                                 max-w-[100px] truncate">
                  {session.user?.name}
                </span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-gn-muted transition-transform duration-200 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <>
                  {/* Overlay para cerrar */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-gn-card border
                                  border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-20">

                    {/* Info usuario */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-gn-text text-xs font-semibold truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-gn-muted text-[11px] truncate mt-0.5">
                        {session.user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px]
                                         font-bold uppercase tracking-wide bg-yellow-500/10
                                         border border-yellow-500/25 text-yellow-400">
                          {session.user?.role === 'ADMIN' ? '👑 Admin' : '🛡 Moderador'}
                        </span>
                      )}
                    </div>

                    {/* Links del menú */}
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                    transition-colors ${
                          pathname === '/profile'
                            ? 'text-gn-text bg-white/5'
                            : 'text-gn-muted hover:text-gn-text hover:bg-white/5'
                        }`}
                      >
                        Mi perfil
                      </Link>

                      <Link
                        href="/collection"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                    transition-colors ${
                          pathname === '/collection'
                            ? 'text-gn-text bg-white/5'
                            : 'text-gn-muted hover:text-gn-text hover:bg-white/5'
                        }`}
                      >
                        Mi colección
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                     text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/5
                                     transition-colors"
                        >
                          Panel de admin
                        </Link>
                      )}
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="p-1">
                      <button
                        onClick={() => { signOut(); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                   text-gn-primary hover:bg-gn-primary/10 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-gn-primary hover:bg-gn-primary-dark text-white text-sm font-bold
                         uppercase tracking-wider px-5 py-2 rounded-lg shadow-gn-red
                         transition-all duration-200 hover:-translate-y-0.5"
            >
              ▶ Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  )
}