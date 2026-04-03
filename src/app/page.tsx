// src/app/page.tsx
import Link from 'next/link'
import { StarIcon, BookOpenIcon, UsersIcon } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RatingSystemShowcase } from '@/components/RatingSystemShowcase'
import HeroCharacters from '@/components/HeroCharacters'
import { prisma } from '@/lib/prisma'

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

// Formato compacto: 1240 → "1.2K", 135 → "135"
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

async function getStats() {
  const [games, reviews, gamers] = await Promise.all([
    prisma.game.count({
      where: { status: 'APPROVED' },
    }),
    prisma.review.count(),
    prisma.user.count({
      where: { reviews: { some: {} } },
    }),
  ])
  return { games, reviews, gamers }
}

export default async function Home() {
  const [session, stats] = await Promise.all([
    getServerSession(authOptions),
    getStats(),
  ])

  const statsData = [
    { num: formatCount(stats.games),   label: 'Juegos'  },
    { num: formatCount(stats.reviews), label: 'Reseñas' },
    { num: formatCount(stats.gamers),  label: 'Gamers'  },
  ]

  return (
    <div className="min-h-screen bg-gn-bg font-body">

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center
                          text-center px-6 py-24 overflow-hidden">
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
          <div className="inline-flex items-center gap-2 bg-gn-primary/10 border
                          border-gn-primary/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gn-primary animate-pulse" />
            <span className="text-gn-primary text-xs font-semibold tracking-widest uppercase">
              Tu plataforma gaming
            </span>
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl leading-tight
                         tracking-tight mb-5 text-gn-text">
            Reseña cada<br />
            <span
              className="text-gn-primary"
              style={{ textShadow: '0 0 40px rgba(230,57,70,0.4)' }}
            >
              aventura
            </span>
          </h1>

          <p className="text-gn-muted text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Puntúa, descubre y comparte los videojuegos que te han marcado.
            Una comunidad hecha por gamers, para gamers.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/games"
              className="bg-gn-primary hover:bg-gn-primary-dark text-white font-bold
                         uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-gn-red
                         hover:shadow-gn-red-lg transition-all duration-200 hover:-translate-y-0.5"
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

      {/* ── STATS reales ── */}
      <div className="bg-gn-surface border-y border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 py-5 flex justify-center gap-16">
          {statsData.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display font-bold text-2xl text-gn-primary"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                {s.num}
              </div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-2">
            // Por qué GameNook
          </p>
          <h2 className="font-display font-bold text-3xl text-gn-text">
            Todo en un solo lugar
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-gn-card border border-white/[0.06] rounded-xl p-7 border-t-2
                          ${f.accent} hover:border-white/10 hover:-translate-y-1
                          transition-all duration-200`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-sm tracking-wide mb-2 text-gn-text">
                {f.title}
              </h3>
              <p className="text-gn-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RATING SYSTEM ── */}
      <section className="bg-gn-surface border-y border-white/[0.06] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-2">
            // Sistema de puntuación
          </p>
          <h2 className="font-display font-bold text-3xl text-gn-text mb-8">
            No hay estrellas. Hay niveles.
          </h2>
          <RatingSystemShowcase />
        </div>
      </section>

    </div>
  )
}