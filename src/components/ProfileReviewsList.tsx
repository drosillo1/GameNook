// src/components/ProfileReviewsList.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { RatingBadge } from '@/components/RatingBadge'

const PAGE_SIZE = 10

type SortOption = 'recent' | 'rating_desc' | 'rating_asc'

const SORT_LABELS: Record<SortOption, string> = {
  recent:      'Más recientes',
  rating_desc: 'Mejor puntuadas',
  rating_asc:  'Peor puntuadas',
}

interface ProfileReview {
  id: string
  rating: number
  content: string | null
  createdAt: string
  game: {
    id: string
    title: string
    slug: string
    imageUrl: string | null
    genre: string[]
  }
}

interface Props {
  reviews: ProfileReview[]
}

export default function ProfileReviewsList({ reviews }: Props) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortOption>('recent')

  const sortedReviews = useMemo(() => {
    const copy = [...reviews]
    switch (sort) {
      case 'rating_desc':
        return copy.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'rating_asc':
        return copy.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'recent':
      default:
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [reviews, sort])

  const total = sortedReviews.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const visible = sortedReviews.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setPage(1) // Reiniciar paginación al cambiar de orden
  }

  return (
    <>
      {/* Selector de orden */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-white/[0.06]">
        <span className="text-gn-muted text-xs uppercase tracking-widest font-semibold">
          Ordenar:
        </span>
        <select
          value={sort}
          onChange={e => handleSortChange(e.target.value as SortOption)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg
                     px-3 py-1.5 text-gn-text text-xs font-semibold
                     focus:outline-none focus:border-gn-primary/40
                     focus:ring-1 focus:ring-gn-primary/20
                     cursor-pointer transition-all"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value} className="bg-gn-card">
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {visible.map(review => (
          <Link
            key={review.id}
            href={`/games/${review.game.slug}`}
            className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02]
                       transition-colors group"
          >
            {/* Thumbnail */}
            <div className="w-14 h-10 bg-gn-surface rounded-lg overflow-hidden
                            flex-shrink-0 flex items-center justify-center">
              {review.game.imageUrl ? (
                <img
                  src={review.game.imageUrl}
                  alt={review.game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">🎮</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-gn-text text-sm font-semibold truncate
                            group-hover:text-gn-primary transition-colors">
                {review.game.title}
              </p>
              {review.content ? (
                <p className="text-gn-muted text-xs truncate mt-0.5">
                  {review.content}
                </p>
              ) : (
                <p className="text-gn-subtle text-xs mt-0.5">Sin comentario</p>
              )}
              <p className="text-gn-subtle text-[11px] mt-1">
                {new Date(review.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>

            {/* Rating */}
            <RatingBadge rating={review.rating} />
          </Link>
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