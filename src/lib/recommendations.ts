// src/lib/recommendations.ts
import { prisma } from '@/lib/prisma'
import { getTopGenres } from '@/lib/profileStats'
import { translateGenre } from '@/lib/genres'

export const RECOMMENDATIONS_COUNT = 12

// Cuántos géneros favoritos se usan en la fase de relleno por afinidad
const FAVORITE_GENRES_FOR_FILL = 3


export type RecommendationSource = 'similar' | 'genre' | 'popular'


export interface RecommendationOrigin {
  title: string
  slug:  string
}

export interface RecommendedGame {
  id:            string
  slug:          string
  title:         string
  imageUrl:      string | null
  genre:         string[]
  averageRating: number | null
  _count:        { reviews: number }
  source:        RecommendationSource
  becauseOf:     RecommendationOrigin[]
  matchCount:    number
}


export type RecommendationLevel = 0 | 1 | 2

export interface RecommendationsResult {
  level:           RecommendationLevel
  completedCount:  number
  games:           RecommendedGame[]
  /** Géneros presentes en el resultado — alimenta el filtro del cliente */
  availableGenres: string[]
}


interface RawGameRow {
  id:              string
  slug:            string
  title:           string
  imageUrl:        string | null
  genre:           string[]
  igdbId:          number | null
  popularityScore: number
  reviews:         { rating: number }[]
  _count:          { reviews: number }
}

function toRecommendation(
  row:        RawGameRow,
  source:     RecommendationSource,
  becauseOf:  RecommendationOrigin[] = [],
  matchCount: number                 = 0,
): RecommendedGame {
  const averageRating = row.reviews.length > 0
    ? row.reviews.reduce((s, r) => s + r.rating, 0) / row.reviews.length
    : null

  return {
    id:       row.id,
    slug:     row.slug,
    title:    row.title,
    imageUrl: row.imageUrl,
    genre:    row.genre,
    averageRating,
    _count:   row._count,
    source,
    becauseOf,
    matchCount,
  }
}


async function fetchPopular(opts: {
  exclude: Set<string>
  genres:  string[]
  limit:   number
  now:     Date
}): Promise<RawGameRow[]> {
  if (opts.limit <= 0) return []

  const excludeArray = Array.from(opts.exclude)

  return prisma.game.findMany({
    where: {
      status:      'APPROVED',
      releaseDate: { lte: opts.now },
      ...(excludeArray.length  > 0 ? { id:    { notIn:   excludeArray } } : {}),
      ...(opts.genres.length   > 0 ? { genre: { hasSome: opts.genres  } } : {}),
    },
    orderBy: { popularityScore: 'desc' },
    take:    opts.limit,
    select: {
      id:              true,
      slug:            true,
      title:           true,
      imageUrl:        true,
      genre:           true,
      igdbId:          true,
      popularityScore: true,
      reviews: { select: { rating: true } },
      _count:  { select: { reviews: true } },
    },
  })
}


export async function getRecommendations(userId: string): Promise<RecommendationsResult> {
  const now = new Date()

  // Una sola query cubre: exclusiones (toda la colección) + juegos completados
  const collection = await prisma.gameCollection.findMany({
    where:  { userId },
    select: {
      status: true,
      gameId: true,
      game: {
        select: {
          id:                 true,
          title:              true,
          slug:               true,
          igdbId:             true,
          genre:              true,
          similarGameIgdbIds: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const excludedIds    = new Set(collection.map(c => c.gameId))
  const completed      = collection.filter(c => c.status === 'COMPLETED')
  const completedCount = completed.length

  const level: RecommendationLevel =
    completedCount === 0 ? 0 : completedCount <= 2 ? 1 : 2

  // Géneros favoritos — reutiliza el helper del perfil, sobre toda la colección
  const favoriteGenres = getTopGenres(collection, FAVORITE_GENRES_FOR_FILL)
    .map(g => g.genre)

  // ── Fase 1: frecuencia de aparición como "similar" ──
  const frequency = new Map<number, { count: number; sources: RecommendationOrigin[] }>()

  for (const entry of completed) {
    // Set por juego: si IGDB repitiera un id, no debe contar doble
    for (const igdbId of new Set(entry.game.similarGameIgdbIds)) {
      const acc = frequency.get(igdbId) ?? { count: 0, sources: [] }
      acc.count += 1
      acc.sources.push({ title: entry.game.title, slug: entry.game.slug })
      frequency.set(igdbId, acc)
    }
  }

  const candidateIgdbIds = Array.from(frequency.keys())
  let similar: RecommendedGame[] = []

  if (candidateIgdbIds.length > 0) {
    const rows = await prisma.game.findMany({
      where: {
        igdbId:      { in: candidateIgdbIds },
        status:      'APPROVED',
        releaseDate: { lte: now },
      },
      select: {
        id:              true,
        slug:            true,
        title:           true,
        imageUrl:        true,
        genre:           true,
        igdbId:          true,
        popularityScore: true,
        reviews: { select: { rating: true } },
        _count:  { select: { reviews: true } },
      },
    })

    similar = rows
      .filter(row => !excludedIds.has(row.id))
      .map(row => ({ row, meta: frequency.get(row.igdbId as number)! }))
      // Frecuencia primero; empate resuelto por popularidad precalculada
      .sort((a, b) =>
        b.meta.count - a.meta.count ||
        b.row.popularityScore - a.row.popularityScore
      )
      .map(({ row, meta }) => toRecommendation(row, 'similar', meta.sources, meta.count))
  }

  const games: RecommendedGame[] = similar.slice(0, RECOMMENDATIONS_COUNT)
  const usedIds = new Set([...excludedIds, ...games.map(g => g.id)])

  // ── Fase 2: relleno por afinidad de género ──
  if (games.length < RECOMMENDATIONS_COUNT && favoriteGenres.length > 0) {
    const rows = await fetchPopular({
      exclude: usedIds,
      genres:  favoriteGenres,
      limit:   RECOMMENDATIONS_COUNT - games.length,
      now,
    })
    for (const row of rows) {
      games.push(toRecommendation(row, 'genre'))
      usedIds.add(row.id)
    }
  }

  // ── Fase 3: relleno neutro — garantiza que nunca hay página vacía ──
  if (games.length < RECOMMENDATIONS_COUNT) {
    const rows = await fetchPopular({
      exclude: usedIds,
      genres:  [],
      limit:   RECOMMENDATIONS_COUNT - games.length,
      now,
    })
    for (const row of rows) {
      games.push(toRecommendation(row, 'popular'))
      usedIds.add(row.id)
    }
  }

  const availableGenres = Array.from(new Set(games.flatMap(g => g.genre)))
    .sort((a, b) => translateGenre(a).localeCompare(translateGenre(b), 'es'))

  return { level, completedCount, games, availableGenres }
}