// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getIGDBGameDetails, mapIGDBToDBFields } from '@/lib/igdb'
import { rateLimit, rateLimitResponse, parsePagination, RATE_LIMITS } from '@/lib/rateLimit'

const DESCRIPTION_MAX_LENGTH = 5000

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  // Fallback por si el título produce un slug vacío.
  let slug    = baseSlug || 'juego'
  let counter = 1
  while (true) {
    const existing = await prisma.game.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug || 'juego'}-${counter}`
    counter++
  }
}

const canModerate = (role: string) => role === 'ADMIN' || role === 'MODERATOR'

export async function GET(request: NextRequest) {
  try {
    const session  = await getServerSession(authOptions)
    const userRole = session?.user?.role ?? 'USER'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.slice(0, 100) || null

.
    const { limit, offset } = parsePagination(
      searchParams.get('limit'),
      searchParams.get('offset')
    )

    const statusFilter = canModerate(userRole)
      ? {}
      : { status: 'APPROVED' as const }

    const searchFilter = search ? {
      OR: [
        { title:       { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { genre:       { hasSome: [search] } },
      ],
    } : {}

    const games = await prisma.game.findMany({
      where:   { ...statusFilter, ...searchFilter },
      include: {
        reviews:   { select: { rating: true } },
        _count:    { select: { reviews: true } },
        submitter: { select: { name: true } },
      },
      orderBy: { title: 'asc' },
      take:    limit,
      skip:    offset,
    })

    const gamesWithRating = games.map(game => ({
      ...game,
      igdbRating:      game.igdbRating      ?? null,
      igdbRatingCount: game.igdbRatingCount ?? null,
      averageRating: game.reviews.length > 0
        ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length
        : null,
    }))

    return NextResponse.json(gamesWithRating)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: userId } = session.user

    // Rate limit 
    const rl = await rateLimit(
      `games:create:${userId}`,
      RATE_LIMITS.GAME_CREATE.limit,
      RATE_LIMITS.GAME_CREATE.windowSeconds
    )
    if (!rl.ok) {
      return rateLimitResponse(
        rl,
        `Has alcanzado el límite de ${RATE_LIMITS.GAME_CREATE.limit} juegos añadidos por día. Inténtalo mañana.`
      )
    }

    const body = await request.json()
    const { igdbId, description } = body


    if (typeof igdbId !== 'number' || !Number.isInteger(igdbId) || igdbId <= 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar un juego desde IGDB' },
        { status: 400 }
      )
    }

    const existingByIgdbId = await prisma.game.findUnique({ where: { igdbId } })
    if (existingByIgdbId) {
      return NextResponse.json(
        { error: 'Este juego ya existe en la plataforma' },
        { status: 400 }
      )
    }

    // Verificación real contra IGDB. Si no existe allí, no se crea aquí.
    let igdbDetails
    try {
      igdbDetails = await getIGDBGameDetails(igdbId)
    } catch (error) {
      console.error('Error fetching IGDB details:', error)
      return NextResponse.json(
        { error: 'No se ha podido verificar el juego con IGDB. Inténtalo de nuevo.' },
        { status: 502 }
      )
    }

    if (!igdbDetails) {
      return NextResponse.json(
        { error: 'El juego no existe en IGDB' },
        { status: 400 }
      )
    }


    const title = igdbDetails.name?.trim()
    if (!title) {
      return NextResponse.json(
        { error: 'El juego de IGDB no tiene título válido' },
        { status: 400 }
      )
    }

    const existingByTitle = await prisma.game.findFirst({
      where: { title: { equals: title, mode: 'insensitive' } },
      select: { id: true },
    })
    if (existingByTitle) {
      return NextResponse.json(
        { error: 'Este juego ya existe en la plataforma' },
        { status: 400 }
      )
    }

    let finalDescription: string | null = null
    if (typeof description === 'string' && description.trim()) {
      finalDescription = description.trim().slice(0, DESCRIPTION_MAX_LENGTH)
    } else if (igdbDetails.summary?.trim()) {
      finalDescription = igdbDetails.summary.trim().slice(0, DESCRIPTION_MAX_LENGTH)
    }


    const imageUrl    = igdbDetails.cover?.url ?? null
    const releaseDate = igdbDetails.first_release_date
      ? new Date(igdbDetails.first_release_date * 1000)
      : null
    const genre    = (igdbDetails.genres    ?? []).map(g => g.name).filter(Boolean)
    const platform = (igdbDetails.platforms ?? []).map(p => p.name).filter(Boolean)

    const enrichedFields = mapIGDBToDBFields(igdbDetails)

    const slug = await ensureUniqueSlug(generateSlug(title))

    let game
    try {
      game = await prisma.game.create({
        data: {
          title,
          slug,
          description:     finalDescription,
          imageUrl,
          releaseDate,
          genre,
          platform,
          igdbId,
          status:          'APPROVED',
          submittedBy:     userId,
          igdbRating:      igdbDetails.rating       ?? null,
          igdbRatingCount: igdbDetails.rating_count ?? null,
          ...enrichedFields,
        },
        include: {
          reviews: { select: { rating: true } },
          _count:  { select: { reviews: true } },
        },
      })
    } catch (error: any) {
      // En caso de que se registre el mismo juego a la vez
      if (error?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Este juego ya existe en la plataforma' },
          { status: 409 }
        )
      }
      throw error
    }

    revalidatePath('/games')
    revalidatePath('/upcoming')
    revalidateTag('upcoming-games')

    return NextResponse.json({ ...game, averageRating: null }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}