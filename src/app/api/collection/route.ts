// src/app/api/collection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CollectionStatus } from '@prisma/client'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'

// El enum se importa de Prisma en vez de redeclarar la lista a mano: una sola
// fuente de verdad. Si mañana se añade un estado al schema, entra aquí solo.
const VALID_STATUSES = Object.values(CollectionStatus) as string[]

const isValidStatus = (value: unknown): value is CollectionStatus =>
  typeof value === 'string' && VALID_STATUSES.includes(value)

// GET — obtener colección del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')

    // Se valida y se guarda en una variable YA TIPADA. Antes el type guard iba
    // dentro de un `if (status && !isValidStatus(status))`: TypeScript no
    // propaga el estrechamiento fuera de una condición negada, así que en el
    // `where` la variable seguía siendo `string | null` y Prisma la rechazaba.
    let status: CollectionStatus | undefined
    if (statusParam) {
      if (!isValidStatus(statusParam)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      status = statusParam
    }

    const collection = await prisma.gameCollection.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status } : {}),
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

    const body = await request.json()
    const { gameId, status } = body

    if (!gameId || typeof gameId !== 'string') {
      return NextResponse.json({ error: 'gameId es requerido' }, { status: 400 })
    }

    // Aquí el type guard sí estrecha correctamente: al ser un `if (!guard)`
    // con return inmediato, después del bloque `status` es CollectionStatus.
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    // Un gameId inexistente hacía saltar la foreign key en el upsert (P2003)
    // y acababa en 500. Comprobarlo antes permite devolver un 404 honesto.
    const game = await prisma.game.findUnique({
      where:  { id: gameId },
      select: { id: true },
    })
    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
    }

    const entry = await prisma.gameCollection.upsert({
      where:  { userId_gameId: { userId, gameId } },
      update: { status },
      create: { userId, gameId, status },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}