// src/components/ReviewList.tsx
'use client'

import { useState } from 'react'
import { HeartIcon } from 'lucide-react'
import ReviewCard from './ReviewCard'

const PAGE_SIZE = 10

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  updatedAt: string
  userId: string
  likeCount: number
  likedByCurrentUser: boolean
  user: {
    id: string
    name: string | null
    username: string
    image: string | null
  }
}

interface Props {
  reviews: Review[]
  featuredReviews?: Review[]
  currentUserId?: string
}

export default function ReviewList({ reviews, featuredReviews = [], currentUserId }: Props) {
  const [page, setPage] = useState(1)
  const total = reviews.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const visible = reviews.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

  const hasFeatured = featuredReviews.length > 0

  if (total === 0 && !hasFeatured) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🎮</div>
        <p className="text-gn-text font-semibold mb-1">Aún no hay reseñas</p>
        <p className="text-gn-muted text-sm">¡Sé el primero en compartir tu opinión!</p>
      </div>
    )
  }

  return (
    <>
      {hasFeatured && (
        <div className="px-6 py-5 border-b border-white/[0.06] bg-gn-primary/[0.03]">
          <div className="flex items-center gap-1.5 mb-4">
            <HeartIcon className="w-3.5 h-3.5 text-gn-primary" fill="currentColor" />
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
              Reseñas destacadas
            </p>
          </div>
          <div className="space-y-4">
            {featuredReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="divide-y divide-white/[0.04]">
          {visible.map((review) => (
            <div key={review.id} className="px-6 py-5">
              <ReviewCard
                review={review}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="px-6 py-4 border-t border-white/[0.06] text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="text-gn-muted hover:text-gn-primary text-xs font-semibold
                       uppercase tracking-widest transition-colors"
          >
            Ver más reseñas ({total - visible.length} restantes)
          </button>
        </div>
      )}
    </>
  )
}