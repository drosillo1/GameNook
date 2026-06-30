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
  likeCount: number
  likedByCurrentUser: boolean
  user: {
    id: string
    name: string | null
    username: string | null
    displayName: string
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
    <div className="space-y-6">
      {/* Reseñas destacadas */}
      {hasFeatured && (
        <div>
          <div className="flex items-center gap-1.5 mb-4">
            <HeartIcon className="w-3.5 h-3.5 text-gn-primary" fill="currentColor" />
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
              Reseñas destacadas
            </p>
          </div>
          <div className="space-y-3">
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

      {/* Todas las reseñas */}
      {total > 0 && (
        <div>
          {hasFeatured && (
            <div className="flex items-center gap-1.5 mb-4">
              <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest">
                Todas las reseñas
              </p>
            </div>
          )}
          <div className="space-y-3">
            {visible.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => setPage(p => p + 1)}
            className="text-gn-muted hover:text-gn-primary text-xs font-semibold
                       uppercase tracking-widest transition-colors"
          >
            Ver más reseñas ({total - visible.length} restantes)
          </button>
        </div>
      )}
    </div>
  )
}