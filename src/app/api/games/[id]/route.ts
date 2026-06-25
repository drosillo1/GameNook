// src/app/api/games/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

const canModerate = (role: string) => role === 'ADMIN' || role === 'MODERATOR'

// PATCH — cambiar status del juego
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canModerate(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const game = await prisma.game.update({
      where: { id },
      data:  { status },
    })

    // Invalida el listado /games (todas las combinaciones de filtros/orden/página
    // cacheadas bajo esa ruta) y el detalle individual del juego.
    revalidatePath('/games')
    revalidatePath('/admin')
    revalidateTag(`game-${game.slug}`)

    return NextResponse.json(game)
  } catch (error) {
    console.error('Error updating game status:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE — solo admins
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params

    const game = await prisma.game.delete({ where: { id } })

    revalidatePath('/games')
    revalidatePath('/admin')
    revalidateTag(`game-${game.slug}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}