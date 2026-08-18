// src/app/api/cron/popularity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { popularityScore } from '@/lib/popularity'

export const maxDuration = 60


const CHUNK_SIZE = 1000

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const startedAt = Date.now()

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

    const scored = games.map(game => ({
      id:    game.id,
      score: popularityScore(game),
    }))

    let updated = 0


    for (let i = 0; i < scored.length; i += CHUNK_SIZE) {
      const chunk = scored.slice(i, i + CHUNK_SIZE)


      const values = Prisma.join(
        chunk.map(g => Prisma.sql`(${g.id}::text, ${g.score}::double precision)`)
      )

      updated += await prisma.$executeRaw`
        UPDATE "Game" AS g
        SET "popularityScore" = v.score,
            "updatedAt"       = NOW()
        FROM (VALUES ${values}) AS v(id, score)
        WHERE g.id = v.id
      `
    }

    const ms = Date.now() - startedAt
    console.log(`[cron/popularity] ${updated}/${games.length} juegos en ${ms} ms`)

    return NextResponse.json({ ok: true, updated, total: games.length, ms })
  } catch (error) {
    console.error('Error en cron de popularidad:', error)
    return NextResponse.json({ error: 'Error recalculando popularidad' }, { status: 500 })
  }
}