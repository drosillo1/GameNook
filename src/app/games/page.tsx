//src/app/games/page.tsx
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import GamesClient from '@/components/GamesClient'
import type { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import type { SortKey, PaginatedGames } from '@/types/games'

export const revalidate = 3600 // Cache 1 hora

// Tamaño de página fijo — ya no es seleccionable por el usuario
// (antes había selector 24/48/96; se quitó para reducir carga y simplificar UI)
const PAGE_SIZE = 20

const getFilteredGames = (
  sortBy: SortKey,
  selectedGenres: string[],
  minRating: number,
  page = 1,
) => unstable_cache(
  async (): Promise<PaginatedGames> => {
    // Construir where
    const where: Prisma.GameWhereInput = { status: 'APPROVED' }

    if (selectedGenres.length > 0) {
      where.genre = { hasSome: selectedGenres }
    }

    // Construir orderBy — 'popular' ahora usa la columna popularityScore
    // precalculada por cron diario (src/app/api/cron/popularity/route.ts),
    // así que se puede paginar directamente en BD igual que el resto de sorts.
    // Ya NO se trae el catálogo completo a memoria en cada request.
    let orderBy: Prisma.GameOrderByWithRelationInput | Prisma.GameOrderByWithRelationInput[] = { popularityScore: 'desc' }

    switch (sortBy) {
      case 'popular':      orderBy = { popularityScore: 'desc' }; break
      case 'title_asc':    orderBy = { title: 'asc' }; break
      case 'title_desc':   orderBy = { title: 'desc' }; break
      case 'release_desc': orderBy = { releaseDate: 'desc' }; break
      case 'release_asc':  orderBy = { releaseDate: 'asc' }; break
      case 'added_desc':   orderBy = { createdAt: 'desc' }; break
      case 'rating_desc':  orderBy = { igdbRating: 'desc' }; break
      case 'reviews_desc': orderBy = { reviews: { _count: 'desc' } }; break
      default:              orderBy = { popularityScore: 'desc' }
    }

    // minRating sigue filtrándose por averageRating (rating de usuarios de
    // GameNook), que no está en BD como columna — se sigue calculando tras
    // traer la página. Como ya no traemos el catálogo entero, esto es barato:
    // sólo afecta a los PAGE_SIZE juegos de la página actual, no a todos.
    //
    // Importante: si hay minRating activo, pedimos una página más grande a
    // BD (margen) y filtramos después, porque no podemos filtrar por rating
    // promedio de reviews directamente en la query de Prisma.
    const fetchMultiplier = minRating > 0 ? 4 : 1
    const skip = (page - 1) * PAGE_SIZE

    const total = await prisma.game.count({ where })

    const games = await prisma.game.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        genre: true,
        platform: true,
        releaseDate: true,
        igdbRating: true,
        igdbRatingCount: true,
        createdAt: true,
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip: minRating > 0 ? 0 : skip,
      take: minRating > 0 ? (skip + PAGE_SIZE) * fetchMultiplier : PAGE_SIZE,
    })

    const normalized = games.map(game => ({
      ...game,
      releaseDate: game.releaseDate?.toISOString() ?? null,
      createdAt: game.createdAt.toISOString(),
      averageRating: game.reviews.length > 0
        ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
        : null,
    }))

    if (minRating > 0) {
      const filtered = normalized.filter(
        game => game.averageRating !== null && game.averageRating >= minRating
      )
      const items = filtered.slice(skip, skip + PAGE_SIZE)
      return { items, total: filtered.length }
    }

    return { items: normalized, total }
  },
  ['filtered-games', sortBy, selectedGenres.slice().sort().join(','), minRating.toString(), String(page), String(PAGE_SIZE)],
  { revalidate: 3600 }
)()

const getAllGamesForOptions = unstable_cache(
  async () => {
    const games = await prisma.game.findMany({
      where: { status: 'APPROVED' },
      select: { genre: true, platform: true, releaseDate: true },
    })

    const genres    = new Set<string>()
    const platforms = new Set<string>()
    const years     = new Set<number>()

    games.forEach(game => {
      game.genre.forEach(g => genres.add(g))
      game.platform.forEach(p => platforms.add(p))
      if (game.releaseDate) {
        years.add(new Date(game.releaseDate).getFullYear())
      }
    })

    return {
      genres:    [...genres].sort(),
      platforms: [...platforms].sort(),
      years:     [...years].sort((a, b) => b - a),
    }
  },
  ['game-filter-options'],
  { revalidate: 3600 }
)

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const page = params.page ? parseInt(params.page as string) : 1
  const title = page === 1
    ? 'Catálogo de juegos | GameNook'
    : `Catálogo de juegos - página ${page} | GameNook`
  const description = `Explora el catálogo de GameNook. Navega la página ${page} de nuestra biblioteca de juegos aprobados.`
  const canonicalPath = `https://gamenook.es/games${page === 1 ? '' : `?page=${page}`}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_ES',
      url: canonicalPath,
      siteName: 'GameNook',
    },
    alternates: {
      canonical: canonicalPath,
    },
  }
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  // Parsear parámetros de URL
  const sortBy = (params.sort ?? 'popular') as SortKey
  const selectedGenres = Array.isArray(params.genre)
    ? params.genre
    : params.genre
      ? [params.genre]
      : []
  const minRating = params.rating ? parseInt(params.rating as string) : 0
  const page = params.page ? parseInt(params.page as string) : 1

  const session = await getServerSession(authOptions)
  const [games, options] = await Promise.all([
    getFilteredGames(sortBy, selectedGenres, minRating, page),
    getAllGamesForOptions(),
  ])

  const gameItems = games.items
  const total = games.total
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Construir lista compacta de páginas para mostrar (ej: 1 ... 4 5 6 ... 10)
  const pageButtons: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageButtons.push(i)
  } else {
    pageButtons.push(1)
    if (page > 4) pageButtons.push('...')
    const start = Math.max(2, page - 2)
    const end = Math.min(totalPages - 1, page + 2)
    for (let i = start; i <= end; i++) pageButtons.push(i)
    if (page + 2 < totalPages - 1) pageButtons.push('...')
    pageButtons.push(totalPages)
  }

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
          games={gameItems}
          filterOptions={options}
        />

        {/* Pagination controls — sin selector de pageSize, fijo en 20 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {pageButtons.map((p, idx) => (
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-3 py-2 text-gn-muted">…</span>
              ) : (
                <Link
                  key={p}
                  href={`/games?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'page')) as any, page: String(p) } as any).toString()}`}
                  className={`px-3 py-2 border rounded-lg ${p === page ? 'bg-gn-primary text-white' : 'bg-gn-card'}`}
                >
                  {p}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}