// src/app/api/igdb/prefill/[igdbId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getIGDBGameDetails } from '@/lib/igdb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ igdbId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { igdbId } = await params
    const id = parseInt(igdbId)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const game = await getIGDBGameDetails(id)
    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado en IGDB' }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('IGDB prefill error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}