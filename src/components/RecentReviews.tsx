// src/components/RecentReviews.tsx
'use client'

import { useRef, useEffect } from 'react'

const RATING_META: Record<number, { icon: string; color: string; label: string }> = {
  1:  { icon: '🎮', color: '#6b7280', label: 'Jugable'        },
  2:  { icon: '🎮', color: '#6b7280', label: 'Jugable'        },
  3:  { icon: '❤️', color: '#3b82f6', label: 'Entretenido'    },
  4:  { icon: '❤️', color: '#3b82f6', label: 'Entretenido'    },
  5:  { icon: '⚡', color: '#a855f7', label: 'Recomendado'    },
  6:  { icon: '⚡', color: '#a855f7', label: 'Recomendado'    },
  7:  { icon: '🏆', color: '#f97316', label: 'Imprescindible' },
  8:  { icon: '🏆', color: '#f97316', label: 'Imprescindible' },
  9:  { icon: '👑', color: '#fbbf24', label: 'Obra Maestra'   },
  10: { icon: '👑', color: '#fbbf24', label: 'Obra Maestra'   },
}

interface Review {
  id:      string
  rating:  number
  content: string | null
  game: {
    title:    string
    slug:     string
    imageUrl: string | null
  }
  user: {
    name:   string | null
    image:  string | null
    avatar: string | null
  }
}

interface Props {
  reviews: Review[]
}

function ReviewCard({ review }: { review: Review }) {
  const meta = RATING_META[review.rating] ?? RATING_META[5]

  return (
    <div
      className="flex-shrink-0 w-72 bg-gn-card border border-white/[0.06]
                 rounded-xl overflow-hidden hover:border-gn-primary/25
                 transition-colors duration-200"
    >
      {/* Imagen del juego */}
      <div className="relative h-32 bg-gn-surface overflow-hidden">
        {review.game.imageUrl ? (
          <img
            src={review.game.imageUrl}
            alt={review.game.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        {/* Overlay gradiente para leer el título */}
        <div className="absolute inset-0 bg-gradient-to-t from-gn-card/90 to-transparent" />

        {/* Título del juego sobre la imagen */}
        <p
          className="absolute bottom-2 left-3 right-3 font-display font-bold
                     text-xs text-gn-text truncate"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {review.game.title}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Usuario + rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0
                            bg-gn-primary/20 flex items-center justify-center">
              {review.user.image || review.user.avatar ? (
                <img
                  src={(review.user.image ?? review.user.avatar)!}
                  alt={review.user.name ?? ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gn-primary text-xs font-bold">
                  {review.user.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <span className="text-gn-muted text-xs font-semibold truncate max-w-[90px]">
              {review.user.name ?? 'Gamer'}
            </span>
          </div>

          {/* Rating chip */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold"
            style={{
              background:  `${meta.color}18`,
              borderColor: `${meta.color}40`,
              color:        meta.color,
            }}
          >
            <span>{meta.icon}</span>
            <span style={{ fontFamily: 'Orbitron, monospace' }}>
              {review.rating}
            </span>
          </div>
        </div>

        {/* Texto de la reseña */}
        {review.content ? (
          <p className="text-gn-muted text-xs leading-relaxed line-clamp-3">
            "{review.content}"
          </p>
        ) : (
          <p className="text-gn-subtle text-xs italic">
            Sin comentario
          </p>
        )}
      </div>
    </div>
  )
}

export default function RecentReviews({ reviews }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Scroll automático infinito con CSS animation
  // Duplicamos las cards para el efecto de loop sin glitch
  const doubled = [...reviews, ...reviews]

  return (
    <div className="overflow-hidden relative">
      {/* Fade en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10
                      bg-gradient-to-r from-gn-bg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10
                      bg-gradient-to-l from-gn-bg to-transparent pointer-events-none" />

      <div
        ref={trackRef}
        className="flex gap-4 w-max"
        style={{ animation: 'scroll-reviews 40s linear infinite' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'
        }}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
    </div>
  )
}