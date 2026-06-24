import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import GamesClient from '@/components/GamesClient'
import type { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import type { Game, SortKey, PaginatedGames } from '@/types/games'

export const revalidate = 3600 // Cache 1 hora

// ── Popularidad con boost para juegos recientes ──
// Replica la misma lógica que en GamesClient.tsx para mantener
// el sort del servidor consistente con la fórmula de popularidad.
function popularityScore(game: {
  igdbRating: number | null
  igdbRatingCount: number | null
  releaseDate: string | null
}): number {
  const rating = game.igdbRating      ?? 0
  const count  = game.igdbRatingCount ?? 0
  const now    = Date.now()

  const qualityScore  = rating / 100
  const popRaw        = count > 0 ? Math.log10(count + 1) : 0
  const popScore       = Math.min(popRaw / 5, 1)

  let recencyScore = 0.5
  let monthsOld    = 999
  if (game.releaseDate) {
    const ageYears = (now - new Date(game.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
    recencyScore   = 1 / (1 + ageYears * 0.08)
    monthsOld      = ageYears * 12
  }

  const newGameBoost = monthsOld < 3 ? 1.4 : monthsOld < 6 ? 1.2 : 1.0

  return ((qualityScore * 0.40) + (popScore * 0.35) + (recencyScore * 0.25)) * newGameBoost
}

const getFilteredGames = (
  sortBy: SortKey,
  selectedGenres: string[],
  minRating: number,
  page = 1,
  pageSize = 48,
) => unstable_cache(
  async (): Promise<PaginatedGames> => {
    // Construir where
    const where: Prisma.GameWhereInput = { status: 'APPROVED' }

    if (selectedGenres.length > 0) {
      where.genre = { hasSome: selectedGenres }
    }

    // Para 'popular' necesitamos el ranking completo en memoria (no paginable
    // directamente en BD porque depende de un cálculo compuesto), así que
    // traemos todo el conjunto filtrado, ordenamos en JS, y paginamos después.
    if (sortBy === 'popular') {
      const total = await prisma.game.count({ where })

      const allGames = await prisma.game.findMany({
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
      })

      const normalized = allGames.map(game => ({
        ...game,
        releaseDate: game.releaseDate?.toISOString() ?? null,
        createdAt: game.createdAt.toISOString(),
        averageRating: game.reviews.length > 0
          ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
          : null,
      }))

      const filteredByRating = minRating > 0
        ? normalized.filter(game => game.averageRating !== null && game.averageRating >= minRating)
        : normalized

      const sorted = filteredByRating.sort((a, b) => popularityScore(b) - popularityScore(a))

      const skip = (page - 1) * pageSize
      const items = sorted.slice(skip, skip + pageSize)

      return { items, total: filteredByRating.length }
    }

    // Construir orderBy para el resto de sorts (estos sí se pueden paginar en BD)
    let orderBy: Prisma.GameOrderByWithRelationInput | Prisma.GameOrderByWithRelationInput[] = { title: 'asc' }

    switch (sortBy) {
      case 'title_asc':    orderBy = { title: 'asc' }; break
      case 'title_desc':   orderBy = { title: 'desc' }; break
      case 'release_desc': orderBy = { releaseDate: 'desc' }; break
      case 'release_asc':  orderBy = { releaseDate: 'asc' }; break
      case 'added_desc':   orderBy = { createdAt: 'desc' }; break
      case 'rating_desc':  orderBy = { igdbRating: 'desc' }; break
      case 'reviews_desc': orderBy = { reviews: { _count: 'desc' } }; break
      default:              orderBy = { title: 'asc' }
    }

    const total = await prisma.game.count({ where })

    const skip = (page - 1) * pageSize
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
      skip,
      take: pageSize,
    })

    const normalized = games.map(game => ({
      ...game,
      releaseDate: game.releaseDate?.toISOString() ?? null,
      createdAt: game.createdAt.toISOString(),
      averageRating: game.reviews.length > 0
        ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
        : null,
    }))

    const filtered = minRating > 0
      ? normalized.filter(game => game.averageRating !== null && game.averageRating >= minRating)
      : normalized

    return { items: filtered, total }
  },
  ['filtered-games', sortBy, selectedGenres.slice().sort().join(','), minRating.toString(), String(page), String(pageSize)],
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
  const pageSize = params.pageSize ? parseInt(params.pageSize as string) : 48
  const title = page === 1
    ? 'Catálogo de juegos | GameNook'
    : `Catálogo de juegos - página ${page} | GameNook`
  const description = `Explora el catálogo de GameNook con ${pageSize} juegos por página. Navega la página ${page} de nuestra biblioteca de juegos aprobados.`
  const canonicalPath = `https://gamenook.es/games${page === 1 ? '' : `?page=${page}&pageSize=${pageSize}`}`

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
  const pageSize = params.pageSize ? parseInt(params.pageSize as string) : 48

  const session = await getServerSession(authOptions)
  const [games, options] = await Promise.all([
    getFilteredGames(sortBy, selectedGenres, minRating, page, pageSize),
    getAllGamesForOptions(),
  ])

  const gameItems = games.items
  const total = games.total
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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

        {/* Pagination controls + pageSize selector */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gn-muted">Mostrar</span>
            {[24, 48, 96].map(n => (
              <Link
                key={n}
                href={`/games?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'page')) as any, page: '1', pageSize: String(n) } as any).toString()}`}
                className={`px-2 py-1 text-sm rounded-md border ${n === pageSize ? 'bg-gn-primary text-white' : 'bg-gn-card'}`}
              >
                {n}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            {pageButtons.map((p, idx) => (
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-3 py-2 text-gn-muted">…</span>
              ) : (
                <Link
                  key={p}
                  href={`/games?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'page')) as any, page: String(p), pageSize: String(pageSize) } as any).toString()}`}
                  className={`px-3 py-2 border rounded-lg ${p === page ? 'bg-gn-primary text-white' : 'bg-gn-card'}`}
                >
                  {p}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}