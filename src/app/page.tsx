// src/app/page.tsx
import Link from 'next/link'
import { StarIcon, BookOpenIcon, UsersIcon } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RatingSystemShowcase } from '@/components/RatingSystemShowcase'
import HeroCharacters from '@/components/HeroCharacters'
import { prisma } from '@/lib/prisma'
import { ScrollingText } from '@/components/ScrollingText'
import { Counter } from '@/components/Counter'
import RecentReviews from '@/components/RecentReviews'

const features = [
  {
    icon: <StarIcon className="w-5 h-5" />,
    title: 'Sistema gaming',
    desc: 'Puntúa del 1 al 10 con iconos temáticos: desde Jugable hasta Obra Maestra.',
    accent: 'border-t-gn-primary',
    iconBg: 'bg-gn-primary/10 text-gn-primary',
  },
  {
    icon: <BookOpenIcon className="w-5 h-5" />,
    title: 'Tu biblioteca',
    desc: 'Lleva el registro de todo lo que has jugado, estás jugando o tienes pendiente.',
    accent: 'border-t-gn-accent',
    iconBg: 'bg-gn-accent/10 text-gn-accent',
  },
  {
    icon: <UsersIcon className="w-5 h-5" />,
    title: 'Comunidad',
    desc: 'Lee opiniones reales de otros gamers y descubre tu próxima obsesión.',
    accent: 'border-t-gn-secondary',
    iconBg: 'bg-gn-secondary/10 text-gn-secondary',
  },
]

const ratings = [
  { range: '1-2',  icon: '🎮', label: 'Jugable',        color: 'text-gray-400   border-gray-500/30   bg-gray-500/10'   },
  { range: '3-4',  icon: '❤️', label: 'Entretenido',    color: 'text-blue-400   border-blue-500/30   bg-blue-500/10'   },
  { range: '5-6',  icon: '⚡', label: 'Recomendado',    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { range: '7-8',  icon: '🏆', label: 'Imprescindible', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { range: '9-10', icon: '👑', label: 'Obra Maestra',   color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
]

// ── Data ───────────────────────────────────────────────────────
async function getStats() {
  const [games, reviews, gamers] = await Promise.all([
    prisma.game.count({ where: { status: 'APPROVED' } }),
    prisma.review.count(),
    prisma.user.count({ where: { reviews: { some: {} } } }),
  ])
  return { games, reviews, gamers }
}

async function getRecentReviews() {
  return prisma.review.findMany({
    where: {
      content: { not: null },
      game:    { status: 'APPROVED' },
    },
    include: {
      game: { select: { title: true, slug: true, imageUrl: true } },
      user: { select: { name: true, image: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
}

// ── Page ───────────────────────────────────────────────────────
export default async function Home() {
  const [session, stats, recentReviews] = await Promise.all([
    getServerSession(authOptions),
    getStats(),
    getRecentReviews(),
  ])

  return (
    <div className="min-h-screen bg-gn-bg font-body">

      {/* ── HERO ── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center
                   text-center px-6 py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gn-hero-glow" />
        <div
          className="absolute inset-0 bg-gn-grid"
          style={{
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />

        <HeroCharacters />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Título con texto rotante */}
          <h1
            className="font-display font-black text-5xl md:text-7xl lg:text-8xl
                       leading-[0.9] tracking-tighter mb-8 text-gn-text uppercase"
          >
            Reseña cada<br />
            <ScrollingText words={['Aventura', 'Batalla', 'Misión', 'Historia']} />
          </h1>

          <p
            className="text-gn-muted text-lg md:text-xl leading-relaxed
                       max-w-xl mx-auto mb-10 font-medium"
          >
            Puntúa, descubre y comparte los videojuegos que te han marcado.
            Una comunidad hecha por gamers, para gamers.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/games"
              className="bg-gn-primary hover:bg-gn-primary-dark text-white font-bold
                         uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-gn-red
                         hover:shadow-gn-red-lg transition-all duration-200
                         hover:-translate-y-0.5"
            >
              ▶ Explorar juegos
            </Link>

            {!session && (
              <Link
                href="/auth/signin"
                className="border border-gn-subtle hover:border-gn-muted text-gn-text
                           font-semibold uppercase tracking-wider px-8 py-3.5 rounded-lg
                           hover:bg-white/5 transition-all duration-200"
              >
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS con Counter animado ── */}
      <div className="bg-gn-surface border-y border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 py-6 flex justify-center gap-16">
          {[
            { end: stats.games,   label: 'Juegos'  },
            { end: stats.reviews, label: 'Reseñas' },
            { end: stats.gamers,  label: 'Gamers'  },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display font-bold text-2xl text-gn-primary"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                <Counter end={s.end} duration={1500} />
              </div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOCIAL PROOF — Últimas reseñas ── */}
      {recentReviews.length >= 4 && (
        <section className="py-14 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 mb-8">
            <p className="text-gn-primary text-xs font-semibold uppercase
                          tracking-widest mb-1">
              // Lo que dice la comunidad
            </p>
            <h2 className="font-display font-bold text-3xl text-gn-text">
              Últimas reseñas
            </h2>
          </div>
          <RecentReviews reviews={recentReviews as any} />
        </section>
      )}

      {/* ── CTA FINAL ── */}
      {!session && (
        <section className="relative py-24 px-6 overflow-hidden">
          {/* Fondo con glow centrado */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(230,57,70,0.1) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 bg-gn-grid opacity-30"
            style={{
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
            }}
          />

          <div className="relative max-w-2xl mx-auto text-center">
            <p className="text-gn-primary text-xs font-semibold uppercase
                          tracking-widest mb-3">
              // Únete ahora
            </p>
            <h2
              className="font-display font-black text-4xl md:text-5xl text-gn-text
                         mb-4 uppercase tracking-tight"
            >
              ¿Listo para empezar?
            </h2>
            <p className="text-gn-muted text-lg leading-relaxed mb-8 max-w-md mx-auto">
              Crea tu cuenta gratis y empieza a construir
              tu biblioteca personal hoy mismo.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/auth/signin"
                className="bg-gn-primary hover:bg-gn-primary-dark text-white font-bold
                           uppercase tracking-wider px-10 py-4 rounded-lg shadow-gn-red
                           hover:shadow-gn-red-lg transition-all duration-200
                           hover:-translate-y-0.5 text-lg"
              >
                ▶ Crear cuenta gratis
              </Link>
              <Link
                href="/games"
                className="border border-gn-subtle hover:border-gn-muted text-gn-text
                           font-semibold uppercase tracking-wider px-10 py-4 rounded-lg
                           hover:bg-white/5 transition-all duration-200 text-lg"
              >
                Explorar primero
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}