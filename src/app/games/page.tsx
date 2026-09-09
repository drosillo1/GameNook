//src/app/games/page.tsx
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import GamesClient from '@/components/GamesClient'
import { SITE_URL } from '@/lib/site'
import type { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import type { SortKey, PaginatedGames } from '@/types/games'

export const revalidate = 3600 // Cache 1 hora

// Tamaño de página fijo — ya no es seleccionable por el usuario
// (antes había selector 24/48/96; se quitó para reducir carga y simplificar UI)
const PAGE_SIZE = 20


function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}


function releasedFilter(today: string): Prisma.GameWhereInput {
  return { releaseDate: { lte: new Date(`${today}T23:59:59.999Z`) } }
}

const GAME_SELECT = {
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
} satisfies Prisma.GameSelect

const getFilteredGames = (
  sortBy: SortKey,
  selectedGenres: string[],
  minRating: number,
  page = 1,
  today: string,
) => unstable_cache(
  async (): Promise<PaginatedGames> => {
    // Construir where
    const where: Prisma.GameWhereInput = {
      status: 'APPROVED',
      ...releasedFilter(today),
    }

    if (selectedGenres.length > 0) {
      where.genre = { hasSome: selectedGenres }
    }

    // Construir orderBy — 'popular' usa la columna popularityScore precalculada
    // por cron diario (src/app/api/cron/popularity/route.ts), así que se puede
    // paginar directamente en BD igual que el resto de sorts.
    let orderBy: Prisma.GameOrderByWithRelationInput = { popularityScore: 'desc' }

    switch (sortBy) {
      case 'popular':      orderBy = { popularityScore: 'desc' }; break
      case 'title_asc':    orderBy = { title: 'asc' }; break
      case 'title_desc':   orderBy = { title: 'desc' }; break
      case 'release_desc': orderBy = { releaseDate: { sort: 'desc', nulls: 'last' } }; break
      case 'release_asc':  orderBy = { releaseDate: { sort: 'asc',  nulls: 'last' } }; break
      case 'added_desc':   orderBy = { createdAt: 'desc' }; break
      case 'rating_desc':  orderBy = { igdbRating: { sort: 'desc', nulls: 'last' } }; break
      case 'reviews_desc': orderBy = { reviews: { _count: 'desc' } }; break
      default:              orderBy = { popularityScore: 'desc' }
    }

    const skip = (page - 1) * PAGE_SIZE

    // ── Camino con filtro de nota ────────────────────────────────────────
    //
    // `averageRating` es la media de reseñas de GameNook y no existe como
    // columna, así que no se puede filtrar en la query de Prisma.
    //
    // Una query LIGERA (solo id + ratings) para saber qué juegos superan el
    // umbral y cuántos son en total, y una segunda query con los datos
    // completos de únicamente los 20 de la página pedida.
    if (minRating > 0) {
      const all = await prisma.game.findMany({
        where,
        orderBy,
        select: { id: true, reviews: { select: { rating: true } } },
      })

      const qualifyingIds = all
        .filter(g => {
          if (g.reviews.length === 0) return false
          const avg = g.reviews.reduce((s, r) => s + r.rating, 0) / g.reviews.length
          return avg >= minRating
        })
        .map(g => g.id)

      const pageIds = qualifyingIds.slice(skip, skip + PAGE_SIZE)

      if (pageIds.length === 0) {
        return { items: [], total: qualifyingIds.length }
      }

      const rows = await prisma.game.findMany({
        where:  { id: { in: pageIds } },
        select: GAME_SELECT,
      })

      // `in` no garantiza orden: se reordena según la secuencia ya ordenada
      const byId = new Map(rows.map(r => [r.id, r]))
      const items = pageIds
        .map(id => byId.get(id))
        .filter((g): g is NonNullable<typeof g> => g !== undefined)
        .map(game => ({
          ...game,
          releaseDate: game.releaseDate?.toISOString() ?? null,
          createdAt:   game.createdAt.toISOString(),
          averageRating: game.reviews.length > 0
            ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
            : null,
        }))

      return { items, total: qualifyingIds.length }
    }

    // ── Camino normal — paginación íntegra en BD ─────────────────────────
    const [total, games] = await Promise.all([
      prisma.game.count({ where }),
      prisma.game.findMany({
        where,
        select: GAME_SELECT,
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
    ])

    const items = games.map(game => ({
      ...game,
      releaseDate: game.releaseDate?.toISOString() ?? null,
      createdAt:   game.createdAt.toISOString(),
      averageRating: game.reviews.length > 0
        ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
        : null,
    }))

    return { items, total }
  },

  ['filtered-games', sortBy, selectedGenres.slice().sort().join(','), minRating.toString(), String(page), String(PAGE_SIZE), today],
  { revalidate: 3600 }
)()

const getAllGamesForOptions = (today: string) => unstable_cache(
  async () => {
    const games = await prisma.game.findMany({
      where: { status: 'APPROVED', ...releasedFilter(today) },
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
  ['game-filter-options', today],
  { revalidate: 3600 }
)()

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
  const description = `Explora el catálogo de GameNook. Navega la página ${page} de nuestra biblioteca de juegos ya lanzados.`
  // Antes estaba hardcodeado como 'https://gamenook.es/games', sin www — y ese
  // host devuelve 307. Le estábamos declarando a Google una canónica que
  // redirige, en TODAS las páginas del catálogo.
  const canonicalPath = `${SITE_URL}/games${page === 1 ? '' : `?page=${page}`}`

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

  // Se calcula aquí, fuera de la caché, y se propaga a las dos consultas.
  const today = getTodayKey()

  const session = await getServerSession(authOptions)
  const [games, options] = await Promise.all([
    getFilteredGames(sortBy, selectedGenres, minRating, page, today),
    getAllGamesForOptions(today),
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