// src/app/api/igdb/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchIGDBGames } from '@/lib/igdb'

export async function GET(request: NextRequest) {
  try {
    // Solo usuarios logueados pueden buscar
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ games: [] })
    }

    const games = await searchIGDBGames(query)
    return NextResponse.json({ games })

  } catch (error) {
    console.error('IGDB search error:', error)
    return NextResponse.json(
      { error: 'Error buscando en IGDB' },
      { status: 500 }
    )
  }
}
