// src/app/api/games/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

const canModerate = (role: string) => role === 'ADMIN' || role === 'MODERATOR'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canModerate(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params

    const game = await prisma.game.findUnique({
      where:  { id },
      select: {
        id: true, title: true, slug: true, status: true,
        _count: { select: { reviews: true, collection: true } },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id:     game.id,
      title:  game.title,
      slug:   game.slug,
      status: game.status,
      counts: {
        reviews:    game._count.reviews,
        collection: game._count.collection,
      },
    })
  } catch (error) {
    console.error('Error fetching game impact:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

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

    const existing = await prisma.game.findUnique({
      where:  { id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
    }

    const game = await prisma.game.update({
      where: { id },
      data:  { status },
    })

    revalidatePath('/games')
    revalidatePath('/upcoming')
    revalidatePath('/admin')
    revalidateTag('upcoming-games')
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

    const game = await prisma.game.findUnique({
      where:  { id },
      select: {
        id: true, slug: true,
        _count: { select: { reviews: true } },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
    }


    if (game._count.reviews > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar: el juego tiene ${game._count.reviews} ${game._count.reviews === 1 ? 'reseña' : 'reseñas'} de usuarios. Recházalo en su lugar.`,
          reviewCount: game._count.reviews,
        },
        { status: 409 }
      )
    }

    // Las entradas de GameCollection sí caen en cascada (onDelete: Cascade).
    await prisma.game.delete({ where: { id } })

    revalidatePath('/games')
    revalidatePath('/upcoming')
    revalidatePath('/admin')
    revalidateTag('upcoming-games')
    revalidateTag(`game-${game.slug}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}