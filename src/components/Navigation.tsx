'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { GamepadIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/games',     label: 'Juegos'    },
  { href: '/games/add', label: 'Agregar'   },
]

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-gn-bg/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
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
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
                pathname === l.href
                  ? 'text-gn-text'
                  : 'text-gn-muted hover:text-gn-text'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gn-card border border-white/[0.08] rounded-lg px-3 py-1.5 hover:border-white/15 transition-colors"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    width={24} height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gn-primary/20 flex items-center justify-center text-gn-primary text-xs font-bold">
                    {session.user?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-gn-text text-sm font-semibold hidden sm:block max-w-[100px] truncate">
                  {session.user?.name}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-gn-muted" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-gn-card border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gn-muted hover:text-gn-text hover:bg-white/5 transition-colors"
                  >
                    Mi perfil
                  </Link>
                  <div className="h-px bg-white/[0.06]" />
                  <button
                    onClick={() => { signOut(); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gn-primary hover:bg-gn-primary/10 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-gn-primary hover:bg-gn-primary-dark text-white text-sm font-bold uppercase tracking-wider px-5 py-2 rounded-lg shadow-gn-red transition-all duration-200"
            >
              ▶ Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  )
}