// src/app/api/games/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Búsqueda ligera para el dropdown de autocompletado — solo APPROVED,
// pocos campos, límite bajo. Independiente de los filtros de /games.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ games: [] })
    }

    const games = await prisma.game.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { genre: { hasSome: [q] } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        releaseDate: true,
      },
      orderBy: { popularityScore: 'desc' },
      take: 8,
    })

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error searching games:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}