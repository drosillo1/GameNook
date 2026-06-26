'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function toggleReviewLikeAction(reviewId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  const userId = session.user.id

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  })

  if (!review) {
    throw new Error('Reseña no encontrada')
  }

  if (review.userId === userId) {
    throw new Error('No puedes votar tu propia reseña')
  }

  const existingLike = await prisma.reviewLike.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  })

  if (existingLike) {
    // Quitar like
    const [, updatedReview] = await prisma.$transaction([
      prisma.reviewLike.delete({
        where: { id: existingLike.id },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ])

    return { liked: false, likeCount: updatedReview.likeCount }
  } else {
    // Dar like
    const [, updatedReview] = await prisma.$transaction([
      prisma.reviewLike.create({
        data: { userId, reviewId },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ])

    return { liked: true, likeCount: updatedReview.likeCount }
  }
}