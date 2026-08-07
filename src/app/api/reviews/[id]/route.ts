// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'

const CONTENT_MAX_LENGTH = 5000

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Obtener reseña específica
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar reseña
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
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
      return rateLimitResponse(rl, 'Estás editando reseñas demasiado rápido. Espera un momento.')
    }

    const body = await request.json()
    const { rating, content } = body

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

    // Buscar la reseña y verificar que pertenece al usuario
    const existingReview = await prisma.review.findUnique({
      where:  { id },
      select: { id: true, userId: true },
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar esta reseña' },
        { status: 403 }
      )
    }

    // Actualizar la reseña
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        content: trimmedContent || null,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar reseña
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Buscar la reseña y verificar que pertenece al usuario
    const existingReview = await prisma.review.findUnique({
      where:  { id },
      select: { id: true, userId: true },
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta reseña' },
        { status: 403 }
      )
    }

    // Eliminar la reseña. Los ReviewLike asociados caen por onDelete: Cascade.
    await prisma.review.delete({ where: { id } })

    return NextResponse.json({ message: 'Reseña eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}