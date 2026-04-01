// src/app/api/igdb/game/[igdbId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIGDBGameDetails } from '@/lib/igdb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ igdbId: string }> }
) {
  try {
    const { igdbId } = await params
    const id = parseInt(igdbId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const game = await getIGDBGameDetails(id)
    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('IGDB game detail error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}