// src/components/ReviewList.tsx
'use client'

import { useState } from 'react'
import ReviewCard from './ReviewCard'

const PAGE_SIZE = 10

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    name: string | null
    username: string
    image: string | null
  }
}

interface Props {
  reviews: Review[]
  currentUserId?: string
}

export default function ReviewList({ reviews, currentUserId }: Props) {
  const [page, setPage] = useState(1)
  const total = reviews.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const visible = reviews.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

  if (total === 0) {
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