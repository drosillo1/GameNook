// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug    = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.game.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

const canModerate = (role: string) => role === 'ADMIN' || role === 'MODERATOR'

export async function GET(request: NextRequest) {
  try {
    const session  = await getServerSession(authOptions)
    const userRole = session?.user?.role ?? 'USER'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit  = parseInt(searchParams.get('limit')  || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const body = await request.json()
    const {
      title, description, imageUrl,
      releaseDate, genre, platform,
      igdbId, descriptionModified,
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
    }

    if (!igdbId) {
      return NextResponse.json(
        { error: 'Debes seleccionar un juego desde IGDB' },
        { status: 400 }
      )
    }

    const existing = await prisma.game.findFirst({
      where: {
        OR: [
          { igdbId },
          { title: { equals: title.trim(), mode: 'insensitive' } },
        ],
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Este juego ya existe en la plataforma' },
        { status: 400 }
      )
    }

    const slug = await ensureUniqueSlug(generateSlug(title.trim()))

    // Lógica de aprobación:
    // - Admin/Moderador → siempre APPROVED
    // - Juego de IGDB sin descripción modificada → APPROVED automático
    // - Juego de IGDB con descripción modificada → PENDING (revisión)
    const status = canModerate(role)
      ? 'APPROVED'
      : descriptionModified
        ? 'PENDING'
        : 'APPROVED'

    const game = await prisma.game.create({
      data: {
        title:               title.trim(),
        slug,
        description:         description?.trim() || null,
        imageUrl:            imageUrl?.trim()    || null,
        releaseDate:         releaseDate ? new Date(releaseDate) : null,
        genre:               Array.isArray(genre)    ? genre.filter(Boolean)    : [],
        platform:            Array.isArray(platform) ? platform.filter(Boolean) : [],
        igdbId:              typeof igdbId === 'number' ? igdbId : null,
        status,
        submittedBy:         userId,
        descriptionModified: Boolean(descriptionModified),
      },
      include: {
        reviews: { select: { rating: true } },
        _count:  { select: { reviews: true } },
      },
    })

    return NextResponse.json({ ...game, averageRating: null }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}