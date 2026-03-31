// src/app/api/collection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — obtener colección del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const collection = await prisma.gameCollection.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        game: {
          include: {
            reviews: { select: { rating: true } },
            _count:  { select: { reviews: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Añadir averageRating a cada juego
    const result = collection.map(entry => ({
      ...entry,
      game: {
        ...entry.game,
        averageRating: entry.game.reviews.length > 0
          ? entry.game.reviews.reduce((s, r) => s + r.rating, 0) / entry.game.reviews.length
          : null,
      },
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST — añadir o actualizar un juego en la colección
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { gameId, status } = await request.json()

    if (!gameId || !status) {
      return NextResponse.json({ error: 'gameId y status son requeridos' }, { status: 400 })
    }

    const validStatuses = ['WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const entry = await prisma.gameCollection.upsert({
      where: {
        userId_gameId: { userId: session.user.id, gameId },
      },
      update: { status },
      create: { userId: session.user.id, gameId, status },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}