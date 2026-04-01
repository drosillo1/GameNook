// src/app/api/games/by-igdb-ids/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',').map(Number).filter(Boolean) ?? []

    if (ids.length === 0) return NextResponse.json([])

    const games = await prisma.game.findMany({
      where:  { igdbId: { in: ids }, status: 'APPROVED' },
      select: { igdbId: true, slug: true },
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games by igdb ids:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}