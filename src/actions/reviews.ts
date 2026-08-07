// src/actions/reviews.ts
'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function toggleReviewLikeAction(reviewId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  const userId = session.user.id


  const rl = await rateLimit(
    `reviews:like:${userId}`,
    RATE_LIMITS.REVIEW_LIKE.limit,
    RATE_LIMITS.REVIEW_LIKE.windowSeconds
  )
  if (!rl.ok) {
    throw new Error('Demasiados votos seguidos. Espera un momento.')
  }

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

  try {
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
  } catch (error: any) {

    if (error?.code === 'P2002' || error?.code === 'P2025') {
      const [current, liked] = await Promise.all([
        prisma.review.findUnique({
          where:  { id: reviewId },
          select: { likeCount: true },
        }),
        prisma.reviewLike.findUnique({
          where:  { userId_reviewId: { userId, reviewId } },
          select: { id: true },
        }),
      ])
      return { liked: !!liked, likeCount: current?.likeCount ?? 0 }
    }
    throw error
  }
}