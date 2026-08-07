// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse, parsePagination, RATE_LIMITS } from '@/lib/rateLimit'

// Tope para reseñas
const CONTENT_MAX_LENGTH = 5000

// POST - Crear nueva reseña
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)


    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const rl = await rateLimit(
      `reviews:write:${userId}`,
      RATE_LIMITS.REVIEW_WRITE.limit,
      RATE_LIMITS.REVIEW_WRITE.windowSeconds
    )
    if (!rl.ok) {
      return rateLimitResponse(rl, 'Estás publicando reseñas demasiado rápido. Espera un momento.')
    }

    const body = await request.json()
    const { gameId, rating, content } = body

    // Validaciones
    if (!gameId || typeof gameId !== 'string') {
      return NextResponse.json(
        { error: 'ID del juego requerido' },
        { status: 400 }
      )
    }


    if (
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 10
    ) {
      return NextResponse.json(
        { error: 'La puntuación debe ser un número entero entre 1 y 10' },
        { status: 400 }
      )
    }

    if (content !== undefined && content !== null && typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenido inválido' },
        { status: 400 }
      )
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : ''
    if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `La reseña no puede superar los ${CONTENT_MAX_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    // Verificar que el juego existe
    const game = await prisma.game.findUnique({
      where:  { id: gameId },
      select: { id: true },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Juego no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario no tenga ya una reseña para este juego
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
      select: { id: true },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya tienes una reseña para este juego' },
        { status: 400 }
      )
    }

    // Crear la reseña
    let review
    try {
      review = await prisma.review.create({
        data: {
          rating,
          content: trimmedContent || null,
          userId,
          gameId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              avatar: true,
            },
          },
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      })
    } catch (error: any) {

      if (error?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya tienes una reseña para este juego' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener reseñas (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const userId = searchParams.get('userId')

    const { limit, offset } = parsePagination(
      searchParams.get('limit'),
      searchParams.get('offset')
    )

    const where: { gameId?: string; userId?: string } = {}

    if (gameId) where.gameId = gameId
    if (userId) where.userId = userId

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}