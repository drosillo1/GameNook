// src/app/actions/deleteAccount.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'


export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { ok: false, error: 'No autorizado' }
  }

  const userId = session.user.id

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Reseñas a las que este usuario dio like. Se leen antes de borrar, porque la cascada las hará desaparecer.
      const likes = await tx.reviewLike.findMany({
        where:  { userId },
        select: { reviewId: true },
      })

      if (likes.length > 0) {
        // Un usuario solo puede dar un like por reseña, así que decrementar en 1 cada una es correcto.
        await tx.review.updateMany({
          where: { id: { in: likes.map(l => l.reviewId) } },
          data:  { likeCount: { decrement: 1 } },
        })
      }

      // 2. Borrar el usuario. Dispara las cascadas y pone a NULL el userId de sus reseñas, que se conservan como anónimas.
      await tx.user.delete({ where: { id: userId } })
    })

    revalidatePath('/')
    return { ok: true }

  } catch (error) {
    console.error('[deleteAccount] Error borrando cuenta:', error)
    return { ok: false, error: 'No se ha podido eliminar la cuenta' }
  }
}