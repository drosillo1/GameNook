'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { GamepadIcon, ChevronDownIcon, ShieldIcon, MenuIcon, XIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// ── Avatar con iniciales ───────────────────────────────────────
function UserAvatar({ image, name, email, size = 6 }: {
  image?: string | null
  name?:  string | null
  email?: string | null
  size?:  number
}) {
  const initial = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()
  const colors = [
    '#e63946', '#f4a261', '#a855f7', '#3b82f6',
    '#10b981', '#f59e0b', '#ec4899', '#06b6d4',
  ]
  const color = colors[(initial.charCodeAt(0) ?? 0) % colors.length]
  const sizeClass = `w-${size} h-${size}`

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'Usuario'}
        className={`${sizeClass} rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center
                  text-white font-bold flex-shrink-0`}
      style={{ background: color, fontSize: size * 2.2 }}
    >
      {initial}
    </div>
  )
}

export default function Navigation() {
  const { data: session } = useSession()
  const pathname          = usePathname()
  const router            = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)

  // Redirigir a onboarding si el usuario no tiene nombre
  useEffect(() => {
    if (
      session &&
      !session.user?.name &&
      pathname !== '/onboarding' &&
      !pathname.startsWith('/auth')
    ) {
      router.push('/onboarding')
    }
  }, [session, pathname, router])

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR'

  const navLinks = [
    { href: '/games',      label: 'Juegos',   always: true  },
    { href: '/collection', label: 'Colección', always: false },
    { href: '/games/add',  label: 'Agregar',  always: false },
  ]

  const visibleLinks = navLinks.filter(l => l.always || session)

  return (
    <header className="sticky top-0 z-50 bg-gn-bg/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px] gap-2">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-3 min-w-0 flex-shrink group"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="GameNook"
            width={56}
            height={56}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
          />

          <span className="font-display font-black text-xl tracking-wide">
            <span className="text-gn-text">Game</span>
            <span className="text-gn-primary">Nook</span>
          </span>
        </Link>

        {/* ── Nav desktop ── */}
        <nav className="hidden md:flex items-center gap-6">
          {visibleLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
                pathname === l.href ? 'text-gn-text' : 'text-gn-muted hover:text-gn-text'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 text-sm font-semibold uppercase
                          tracking-widest transition-colors duration-200 ${
                pathname === '/admin' ? 'text-yellow-400' : 'text-yellow-500/70 hover:text-yellow-400'
              }`}
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* ── Auth + hamburguesa ── */}
        <div className="flex items-center gap-2">

          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gn-card border border-white/[0.08]
                           rounded-lg px-3 py-1.5 hover:border-white/15 transition-colors"
              >
                <UserAvatar
                  image={session.user?.image}
                  name={session.user?.name}
                  email={session.user?.email}
                  size={6}
                />
                <span className="text-gn-text text-sm font-semibold hidden sm:block
                                 max-w-[100px] truncate">
                  {session.user?.name ?? session.user?.email?.split('@')[0]}
                </span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-gn-muted transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-gn-card border
                                  border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-20">

                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                      <UserAvatar
                        image={session.user?.image}
                        name={session.user?.name}
                        email={session.user?.email}
                        size={8}
                      />
                      <div className="min-w-0">
                        <p className="text-gn-text text-xs font-semibold truncate">
                          {session.user?.name ?? 'Usuario'}
                        </p>
                        <p className="text-gn-muted text-[11px] truncate mt-0.5">
                          {session.user?.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px]
                                           font-bold uppercase tracking-wide bg-yellow-500/10
                                           border border-yellow-500/25 text-yellow-400">
                            {session.user?.role === 'ADMIN' ? '👑 Admin' : '🛡 Moderador'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-1">
                      {[
                        { href: '/profile',    label: 'Mi perfil'    },
                        { href: '/collection', label: 'Mi colección' },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                      transition-colors ${
                            pathname === item.href
                              ? 'text-gn-text bg-white/5'
                              : 'text-gn-muted hover:text-gn-text hover:bg-white/5'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
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
                        onClick={() => { signOut(); setDropdownOpen(false) }}
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
              <Link
                href="/auth/signin"
                className="flex-shrink-0 bg-gn-primary hover:bg-gn-primary-dark text-white text-xs sm:text-sm font-bold
             uppercase tracking-wider px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg shadow-gn-red
             transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                ▶ Entrar
              </Link>
          )}

          {/* ── Hamburguesa ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                       border border-white/[0.08] text-gn-muted hover:text-gn-text
                       hover:border-white/20 transition-colors"
            aria-label="Menú"
          >
            {mobileOpen
              ? <XIcon    className="w-4 h-4" />
              : <MenuIcon className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* ── Menú móvil ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-[60px] left-0 right-0 z-40 md:hidden
                          bg-gn-bg border-b border-white/[0.06] shadow-2xl">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">

              {session && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2
                                bg-gn-card border border-white/[0.06] rounded-xl">
                  <UserAvatar
                    image={session.user?.image}
                    name={session.user?.name}
                    email={session.user?.email}
                    size={10}
                  />
                  <div className="min-w-0">
                    <p className="text-gn-text text-sm font-semibold truncate">
                      {session.user?.name ?? 'Usuario'}
                    </p>
                    <p className="text-gn-muted text-xs truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              )}

              {visibleLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold uppercase
                              tracking-widest transition-colors ${
                    pathname === l.href
                      ? 'text-gn-text bg-white/[0.06]'
                      : 'text-gn-muted hover:text-gn-text hover:bg-white/[0.04]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                             font-semibold uppercase tracking-widest text-yellow-500
                             hover:text-yellow-400 hover:bg-yellow-500/5 transition-colors"
                >
                  <ShieldIcon className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <div className="h-px bg-white/[0.06] my-1" />

              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm text-gn-muted
                               hover:text-gn-text hover:bg-white/[0.04] transition-colors"
                  >
                    Mi perfil
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false) }}
                    className="text-left px-3 py-2.5 rounded-lg text-sm text-gn-primary
                               hover:bg-gn-primary/10 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-gn-primary
                             hover:bg-gn-primary-dark text-white text-sm font-bold uppercase
                             tracking-wider rounded-lg transition-colors mt-1"
                >
                  ▶ Entrar
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}