// src/components/RecentReviews.tsx
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
    name:  string | null
    image: string | null
  }
}

interface Props {
  reviews: Review[]
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const meta = RATING_META[review.rating] ?? RATING_META[5]

  return (
    <Link
      href={`/games/${review.game.slug}`}
      className="flex-shrink-0 w-72 bg-gn-card border border-white/[0.06]
                 rounded-xl overflow-hidden hover:border-gn-primary/25
                 hover:-translate-y-1 transition-all duration-200 block"
    >
      {/* Imagen del juego */}
      <div className="relative h-32 bg-gn-surface overflow-hidden">
        {review.game.imageUrl ? (
          <Image
            src={review.game.imageUrl}
            alt={review.game.title}
            fill
            className="object-cover"
            sizes="288px"
            priority={index < 2}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gn-card/90 to-transparent z-10" />
        <p
          className="absolute bottom-2 left-3 right-3 font-display font-bold
                     text-xs text-gn-text truncate z-20"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {review.game.title}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0
                            bg-gn-primary/20 flex items-center justify-center relative">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name ?? 'Avatar del usuario'}
                  fill
                  className="object-cover"
                  sizes="28px"
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

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold"
            style={{
              background:  `${meta.color}18`,
              borderColor: `${meta.color}40`,
              color:        meta.color,
            }}
          >
            <span>{meta.icon}</span>
            <span style={{ fontFamily: 'Orbitron, monospace' }}>{review.rating}</span>
          </div>
        </div>

        {review.content ? (
          <p className="text-gn-muted text-xs leading-relaxed line-clamp-3">
            "{review.content}"
          </p>
        ) : (
          <p className="text-gn-subtle text-xs italic">Sin comentario</p>
        )}
      </div>
    </Link>
  )
}

export default function RecentReviews({ reviews }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const doubled  = [...reviews, ...reviews]

  return (
    <div className="overflow-hidden relative">
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
          <ReviewCard key={`${review.id}-${i}`} review={review} index={i} />
        ))}
      </div>
    </div>
  )
}