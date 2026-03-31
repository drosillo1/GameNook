// src/app/api/collection/[gameId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — estado de un juego concreto en la colección del usuario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
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
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { gameId } = await params

    await prisma.gameCollection.delete({
      where: {
        userId_gameId: { userId: session.user.id, gameId },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing from collection:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}