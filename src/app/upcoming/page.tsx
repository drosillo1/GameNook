// src/app/upcoming/page.tsx
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Monitor, ChevronLeft, Clock, PlusIcon } from 'lucide-react'
import FollowButton from '@/components/FollowButton'
import { translateGenre } from '@/lib/genres'
import { formatMonthYear, getReleaseStatusLabel } from '@/lib/upcoming'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Próximos lanzamientos | GameNook',
  description: 'Descubre los videojuegos que están por llegar. Síguelos para no perderte su lanzamiento.',
  openGraph: {
    title: 'Próximos lanzamientos | GameNook',
    description: 'Descubre los videojuegos que están por llegar.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://gamenook.es/upcoming',
    siteName: 'GameNook',
  },
  alternates: { canonical: 'https://gamenook.es/upcoming' },
}

const getUpcomingGames = unstable_cache(
  async () => {
    const now = new Date()

    const games = await prisma.game.findMany({
      where: {
        status: 'APPROVED',
        releaseDate: { gt: now },
      },
      select: {
        id:          true,
        title:       true,
        slug:        true,
        imageUrl:    true,
        releaseDate: true,
        genre:       true,
        platform:    true,
        releaseStatus: true,
        description: true,
      },
      orderBy: { releaseDate: 'asc' },
    })

    return games.map(g => ({
      ...g,
      releaseDate: g.releaseDate?.toISOString() ?? null,
    }))
  },
  ['upcoming-games'],
  { revalidate: 3600 }
)

interface UpcomingGame {
  id:            string
  title:         string
  slug:          string
  imageUrl:      string | null
  releaseDate:   string | null
  genre:         string[]
  platform:      string[]
  releaseStatus: number | null
  description:   string | null
}

function groupByMonth(games: UpcomingGame[]): { label: string; games: UpcomingGame[] }[] {
  const groups = new Map<string, UpcomingGame[]>()

  for (const game of games) {
    const key = game.releaseDate
      ? formatMonthYear(new Date(game.releaseDate))
      : 'Fecha por confirmar'
    const arr = groups.get(key) ?? []
    arr.push(game)
    groups.set(key, arr)
  }

  return Array.from(groups.entries()).map(([label, games]) => ({ label, games }))
}

function UpcomingGameCard({ game }: { game: UpcomingGame }) {
  const statusLabel = getReleaseStatusLabel(game.releaseStatus)

  return (
    <div className="group bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden
                    hover:border-gn-primary/30 transition-all duration-200">
      <Link href={`/games/${game.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-gn-surface overflow-hidden">
          {game.imageUrl ? (
            <Image
              src={game.imageUrl}
              alt={game.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gn-muted">
              <span className="text-3xl">🎮</span>
            </div>
          )}

          {/* Badge de estado si no es "released" */}
          {statusLabel && game.releaseStatus !== 0 && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md border text-[10px]
                            font-bold uppercase tracking-wide backdrop-blur-sm
                            bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
              {statusLabel}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col gap-2">
        <Link href={`/games/${game.slug}`}>
          <h3 className="font-display font-bold text-sm text-gn-text truncate
                         group-hover:text-gn-primary transition-colors">
            {game.title}
          </h3>
        </Link>

        {game.releaseDate && (
          <span className="flex items-center gap-1.5 text-xs text-gn-muted">
            <Calendar className="w-3 h-3" />
            {new Date(game.releaseDate).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        )}

        {game.platform.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gn-muted min-w-0">
            <Monitor className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{game.platform.slice(0, 3).join(' · ')}</span>
          </span>
        )}

        {game.genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genre.slice(0, 2).map(g => (
              <span
                key={g}
                className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                           text-red-300 text-[10px] font-semibold uppercase tracking-wide rounded"
              >
                {translateGenre(g)}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-white/[0.06]">
          <FollowButton gameId={game.id} />
        </div>
      </div>
    </div>
  )
}

export default async function UpcomingPage() {
  const games = await getUpcomingGames()
  const monthGroups = groupByMonth(games)

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-gn-muted hover:text-gn-text
                     text-xs uppercase tracking-widest font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a juegos
        </Link>

        <div className="mb-10">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Próximos lanzamientos
          </p>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gn-text leading-tight">
            Lo que{' '}
            <span className="text-gn-primary" style={{ textShadow: '0 0 30px rgba(230,57,70,0.35)' }}>
              viene
            </span>
          </h1>
          <p className="text-gn-muted text-sm mt-2 max-w-lg">
            Descubre los juegos que están por llegar y síguelos para no perderte su lanzamiento.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-display font-bold text-xl text-gn-text mb-2">
              Sin lanzamientos próximos
            </h3>
            <p className="text-gn-muted text-sm mb-6 max-w-xs mx-auto">
              Todavía no hay juegos próximos en el catálogo. ¿Esperas un lanzamiento? Agrégalo tú mismo.
            </p>
            <Link
              href="/games/add"
              className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                         text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5
                         rounded-lg shadow-gn-red transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar juego
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-10">
              {monthGroups.map(group => (
                <section key={group.label}>
                  <div className="flex items-center gap-3 mb-5">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <h2 className="font-display font-bold text-lg text-gn-text">
                      {group.label}
                    </h2>
                    <span className="text-gn-muted text-xs">
                      {group.games.length} {group.games.length === 1 ? 'juego' : 'juegos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {group.games.map(game => (
                      <UpcomingGameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* CTA para añadir juegos que falten */}
            <div className="mt-12 text-center py-8 border-t border-white/[0.06]">
              <p className="text-gn-muted text-sm mb-3">
                ¿Echas en falta un lanzamiento?
              </p>
              <Link
                href="/games/add"
                className="inline-flex items-center gap-2 border border-gn-subtle
                           hover:border-gn-primary/30 text-gn-text hover:text-gn-primary
                           text-xs font-bold uppercase tracking-wider px-5 py-2.5
                           rounded-lg hover:bg-gn-primary/5 transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Agrégalo desde IGDB
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}