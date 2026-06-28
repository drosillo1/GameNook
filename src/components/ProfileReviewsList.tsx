// src/components/ProfileReviewsList.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeartIcon } from 'lucide-react'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'
import { getRatingData } from '@/lib/rating'

const PAGE_SIZE = 12

type SortOption = 'recent' | 'rating_desc' | 'rating_asc'

const SORT_LABELS: Record<SortOption, string> = {
  recent:      'Más recientes',
  rating_desc: 'Mejor puntuadas',
  rating_asc:  'Peor puntuadas',
}

const ICON_MAP = { Sword, Heart, Shield, Medal, Trophy, Crown } as const

interface ProfileReview {
  id: string
  rating: number
  content: string | null
  createdAt: string
  likeCount?: number
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
  featuredReviews?: ProfileReview[]
}

function ReviewCard({ review }: { review: ProfileReview }) {
  const { iconName, label } = getRatingData(review.rating)
  const icon = ICON_MAP[iconName as keyof typeof ICON_MAP]

  return (
    <Link
      href={`/games/${review.game.slug}`}
      className="bg-gn-surface/40 border border-white/[0.06] rounded-xl overflow-hidden
                 hover:border-gn-primary/25 hover:-translate-y-0.5 transition-all
                 duration-200 group flex flex-col"
    >
      {/* Portada del juego — formato vertical completo, sin recortes */}
      <div className="relative aspect-[3/4] bg-gn-surface overflow-hidden flex-shrink-0">
        {review.game.imageUrl ? (
          <Image
            src={review.game.imageUrl}
            alt={review.game.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="font-display font-bold text-sm text-gn-text truncate
                      group-hover:text-gn-primary transition-colors">
          {review.game.title}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <PxlKitIcon icon={icon} size={16} />
            <span className="font-medium text-sm text-gn-text">{review.rating}/10</span>
            <span className="text-xs text-gn-muted">{label}</span>
          </div>

          {typeof review.likeCount === 'number' && review.likeCount > 0 && (
            <div className="flex items-center gap-1 text-gn-muted text-xs flex-shrink-0">
              <HeartIcon className="w-3.5 h-3.5" fill="currentColor" />
              {review.likeCount}
            </div>
          )}
        </div>

        {review.content ? (
          <p className="text-gn-muted text-xs leading-relaxed line-clamp-3 break-words">
            {review.content}
          </p>
        ) : (
          <p className="text-gn-subtle text-xs italic">Sin comentario</p>
        )}

        <p className="text-gn-subtle text-[11px] mt-auto pt-1">
          {new Date(review.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>
    </Link>
  )
}

export default function ProfileReviewsList({ reviews, featuredReviews = [] }: Props) {
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
    setPage(1)
  }

  const hasFeatured = featuredReviews.length > 0

  return (
    <>
      {hasFeatured && (
        <div className="px-6 py-5 border-b border-white/[0.06] bg-gn-primary/[0.03]">
          <div className="flex items-center gap-1.5 mb-3">
            <HeartIcon className="w-3.5 h-3.5 text-gn-primary" fill="currentColor" />
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
              Reseñas destacadas
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {featuredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

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

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visible.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="px-6 pb-6 text-center">
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