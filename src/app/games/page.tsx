// src/app/games/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'

// ── Helpers de rating ──────────────────────────────────────────
function getRatingMeta(rating: number | null) {
  if (!rating) return null
  if (rating === 10) return { icon: <PxlKitIcon icon={Crown} size={16} />, label: 'Obra Maestra',   color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' }
  if (rating === 9)  return { icon: <PxlKitIcon icon={Trophy} size={16} />, label: 'Imprescindible', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' }
  if (rating >= 7)   return { icon: <PxlKitIcon icon={Medal} size={16} />, label: 'Muy Bueno',      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' }
  if (rating >= 5)   return { icon: <PxlKitIcon icon={Shield} size={16} />, label: 'Recomendado',    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' }
  if (rating >= 3)   return { icon: <PxlKitIcon icon={Heart} size={16} />, label: 'Entretenido',    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' }
  return               { icon: <PxlKitIcon icon={Sword} size={16} />, label: 'Jugable',            color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' }
}

// ── Data fetch ─────────────────────────────────────────────────
async function getGames() {
  const games = await prisma.game.findMany({
    include: {
      reviews: { select: { rating: true } },
      _count:  { select: { reviews: true } },
    },
    orderBy: { title: 'asc' },
  })

  return games.map(game => ({
    ...game,
    averageRating: game.reviews.length > 0
      ? game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length
      : null,
  }))
}

// ── GameCard ───────────────────────────────────────────────────
function GameCard({ game }: { game: any }) {
  const meta = getRatingMeta(game.averageRating)

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden
                 hover:border-gn-primary/30 hover:-translate-y-1
                 transition-all duration-200 flex flex-col"
    >
      {/* Imagen */}
      <div className="aspect-video bg-gn-surface relative overflow-hidden">
        {game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gn-muted">
            <span className="text-3xl">🎮</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Sin imagen</span>
          </div>
        )}

        {/* Rating badge flotante */}
        <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1
                         rounded-md border text-xs font-bold backdrop-blur-sm
                         bg-gn-bg/80 border-white/10
                         ${meta ? 'text-gn-text' : 'text-gn-muted'}`}
             style={{ fontFamily: 'var(--font-display, monospace)' }}>
          {meta
            ? <><span>{game.averageRating.toFixed(1)}</span>{meta.icon}</>
            : <span>—</span>
          }
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-sm tracking-wide text-gn-text
                       group-hover:text-gn-primary transition-colors truncate mb-1">
          {game.title}
        </h3>

        {game.description && (
          <p className="text-gn-muted text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
            {game.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.04]">
          <span className="text-xs text-gn-muted">
            {game._count.reviews}{' '}
            {game._count.reviews === 1 ? 'reseña' : 'reseñas'}
          </span>

          {game.genre?.length > 0 && (
            <div className="flex gap-1">
              {game.genre.slice(0, 2).map((g: string) => (
                <span
                  key={g}
                  className="px-2 py-0.5 bg-gn-primary/8 border border-gn-primary/20
                             text-red-300 text-[10px] font-semibold uppercase tracking-wide rounded"
                >
                  {g}
                </span>
              ))}
              {game.genre.length > 2 && (
                <span className="px-2 py-0.5 bg-gn-subtle/30 border border-white/[0.06]
                                 text-gn-muted text-[10px] font-semibold rounded">
                  +{game.genre.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton ───────────────────────────────────────────────────
function GamesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="aspect-video bg-gn-surface animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gn-subtle/40 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gn-subtle/30 rounded animate-pulse" />
            <div className="h-3 bg-gn-subtle/30 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── GamesGrid ──────────────────────────────────────────────────
async function GamesGrid({ searchQuery }: { searchQuery?: string }) {
  let games = await getGames()

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    games = games.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.genre.some((gen: string) => gen.toLowerCase().includes(q))
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="font-display font-bold text-xl text-gn-text mb-2">
          {searchQuery ? 'Sin resultados' : 'No hay juegos aún'}
        </h3>
        <p className="text-gn-muted text-sm max-w-xs mx-auto mb-6">
          {searchQuery
            ? `No encontramos nada para "${searchQuery}"`
            : 'Sé el primero en agregar un juego a la plataforma.'}
        </p>
        <Link
          href="/games/add"
          className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                     text-white text-sm font-bold uppercase tracking-wider px-6 py-2.5
                     rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Agregar juego
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {games.map(game => <GameCard key={game.id} game={game} />)}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params  = await searchParams          // Next.js 15: searchParams es async
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gn-bg font-body">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">

        {/* Título + botón */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
              // Biblioteca
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-gn-text leading-tight">
              Juegos{' '}
              <span
                className="text-gn-primary"
                style={{ textShadow: '0 0 30px rgba(230,57,70,0.35)' }}
              >
                disponibles
              </span>
            </h1>
          </div>

          {session && (
            <Link
              href="/games/add"
              className="flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                         text-white font-bold uppercase tracking-wider text-sm
                         px-5 py-2.5 rounded-lg shadow-gn-red transition-all duration-200
                         hover:-translate-y-0.5"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar juego
            </Link>
          )}
        </div>

        {/* Buscador */}
        <form method="GET" className="relative max-w-md mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gn-muted" />
          <input
            type="text"
            name="search"
            placeholder="Buscar juegos, géneros..."
            defaultValue={params.search ?? ''}
            className="w-full pl-11 pr-5 py-3 bg-gn-card border border-white/[0.06]
                       rounded-xl text-gn-text placeholder-gn-muted text-sm
                       focus:outline-none focus:border-gn-primary/40 focus:ring-1
                       focus:ring-gn-primary/20 transition-all"
          />
        </form>

        {/* Contador resultados */}
        {params.search && (
          <p className="text-gn-muted text-sm mb-4">
            Resultados para{' '}
            <span className="text-gn-text font-semibold">"{params.search}"</span>
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <Suspense fallback={<GamesSkeleton />}>
          <GamesGrid searchQuery={params.search} />
        </Suspense>
      </div>
    </div>
  )
}