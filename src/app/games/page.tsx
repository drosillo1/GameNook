import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import GamesClient from '@/components/GamesClient'

export interface Game {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  releaseDate: string | null
  genre: string[]
  platform: string[]
  igdbId: number | null
  igdbRating: number | null
  igdbRatingCount: number | null
  status: string
  createdAt: string
  updatedAt: string
  averageRating: number | null
  _count: { reviews: number }
}

const getAllGames = unstable_cache(
  async () => {
    const games = await prisma.game.findMany({
      where: { status: 'APPROVED' },
      include: {
        reviews: { select: { rating: true } },
        _count:  { select: { reviews: true } },
      },
      orderBy: { title: 'asc' },
    })

    return games.map(game => ({
      ...game,
      releaseDate:   game.releaseDate?.toISOString() ?? null,
      createdAt:     game.createdAt.toISOString(),
      updatedAt:     game.updatedAt.toISOString(),
      averageRating: game.reviews.length > 0
        ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
        : null,
    }))
  },
  ['all-games'],
  { revalidate: 60 }
)

function extractFilterOptions(games: any[]) {
  const genres    = new Set<string>()
  const platforms = new Set<string>()
  const years     = new Set<number>()

  games.forEach(game => {
    game.genre.forEach((g: string) => genres.add(g))
    game.platform.forEach((p: string) => platforms.add(p))
    if (game.releaseDate) {
      years.add(new Date(game.releaseDate).getFullYear())
    }
  })

  return {
    genres:    [...genres].sort(),
    platforms: [...platforms].sort(),
    years:     [...years].sort((a, b) => b - a),
  }
}

export default async function GamesPage() {
  const session = await getServerSession(authOptions)
  const games   = await getAllGames()
  const options = extractFilterOptions(games)

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="text-gn-primary text-xs font-semibold uppercase
                          tracking-widest mb-1">
              // Biblioteca
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl
                           text-gn-text leading-tight">
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
                         px-5 py-2.5 rounded-lg shadow-gn-red transition-all
                         duration-200 hover:-translate-y-0.5 flex-shrink-0"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar juego
            </Link>
          )}
        </div>

        <GamesClient
          games={games as unknown as Game[]}
          filterOptions={options}
        />
      </div>
    </div>
  )
}