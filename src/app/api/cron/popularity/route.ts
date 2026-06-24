// src/app/api/cron/popularity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { popularityScore } from '@/lib/popularity'

export const maxDuration = 60 // segundos — ajustar si el catálogo crece mucho

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const games = await prisma.game.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        igdbRating: true,
        igdbRatingCount: true,
        releaseDate: true,
      },
    })

    let updated = 0
    for (const game of games) {
      const score = popularityScore(game)
      await prisma.game.update({
        where: { id: game.id },
        data: { popularityScore: score },
      })
      updated++
    }

    return NextResponse.json({ ok: true, updated, total: games.length })
  } catch (error) {
    console.error('Error en cron de popularidad:', error)
    return NextResponse.json({ error: 'Error recalculando popularidad' }, { status: 500 })
  }
}