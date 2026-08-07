// src/app/api/collection/[gameId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'

// GET — estado de un juego concreto en la colección del usuario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ entry: null })
    }

    const { gameId } = await params

    const entry = await prisma.gameCollection.findUnique({
      where: {
        userId_gameId: { userId: session.user.id, gameId },
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error fetching collection entry:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE — eliminar juego de la colección
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const rl = await rateLimit(
      `collection:write:${userId}`,
      RATE_LIMITS.COLLECTION_WRITE.limit,
      RATE_LIMITS.COLLECTION_WRITE.windowSeconds
    )
    if (!rl.ok) {
      return rateLimitResponse(rl, 'Demasiados cambios seguidos en tu colección. Espera unos segundos.')
    }

    const { gameId } = await params


    const result = await prisma.gameCollection.deleteMany({
      where: { userId, gameId },
    })

    return NextResponse.json({ ok: true, removed: result.count })
  } catch (error) {
    console.error('Error removing from collection:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}