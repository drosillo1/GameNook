// src/components/CollectionTabs.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlayIcon, CheckIcon, ClockIcon, XIcon } from 'lucide-react'
import { RatingIcon } from './RatingIcon'

type CollectionEntry = {
  id:     string
  status: string
  game: {
    id:        string
    title:     string
    slug:      string
    imageUrl:  string | null
    genre:     string[]
    userReview: { rating: number; content: string | null } | null
    averageRating: number | null
    _count:    { reviews: number }
  }
}

type Grouped = {
  PLAYING:      CollectionEntry[]
  COMPLETED:    CollectionEntry[]
  WANT_TO_PLAY: CollectionEntry[]
  DROPPED:      CollectionEntry[]
}

const TABS = [
  { key: 'PLAYING',      label: 'Jugando',     icon: <PlayIcon  className="w-3.5 h-3.5" />, color: 'text-green-400',  active: 'border-green-400  text-green-400'  },
  { key: 'COMPLETED',    label: 'Completados', icon: <CheckIcon className="w-3.5 h-3.5" />, color: 'text-purple-400', active: 'border-purple-400 text-purple-400' },
  { key: 'WANT_TO_PLAY', label: 'Pendientes',  icon: <ClockIcon className="w-3.5 h-3.5" />, color: 'text-blue-400',   active: 'border-blue-400   text-blue-400'   },
  { key: 'DROPPED',      label: 'Abandonados', icon: <XIcon     className="w-3.5 h-3.5" />, color: 'text-red-400',    active: 'border-red-400    text-red-400'    },
] as const

function getRatingMeta(rating: number) {
  if (rating === 10) return { iconName: 'Crown' as const,  color: '#fbbf24' }
  if (rating === 9)  return { iconName: 'Trophy' as const, color: '#f97316' }
  if (rating >= 7)   return { iconName: 'Medal' as const,  color: '#06b6d4' }
  if (rating >= 5)   return { iconName: 'Shield' as const, color: '#a855f7' }
  if (rating >= 3)   return { iconName: 'Heart' as const,  color: '#3b82f6' }
  return               { iconName: 'Sword' as const,  color: '#6b7280' }
}

function GameCard({ entry }: { entry: CollectionEntry }) {
  const { game } = entry
  const meta = game.userReview ? getRatingMeta(game.userReview.rating) : null

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden
                 hover:border-gn-primary/30 hover:-translate-y-1 transition-all duration-200
                 flex flex-col"
    >
      {/* Imagen */}
      <div className="aspect-video bg-gn-surface relative overflow-hidden">
        {game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gn-muted">
            <span className="text-3xl">🎮</span>
          </div>
        )}

        {/* Badge reseña propia */}
        {meta && game.userReview && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                       rounded-md border text-xs font-bold backdrop-blur-sm bg-gn-bg/80"
            style={{ borderColor: `${meta.color}40`, color: meta.color }}
          >
            <RatingIcon iconName={meta.iconName} size={14} />
            <span style={{ fontFamily: 'Orbitron, monospace' }}>
              {game.userReview.rating}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-sm text-gn-text truncate
                       group-hover:text-gn-primary transition-colors mb-1">
          {game.title}
        </h3>

        {/* Géneros */}
        {game.genre.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {game.genre.slice(0, 2).map(g => (
              <span
                key={g}
                className="px-2 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                           text-red-300 text-[10px] font-semibold uppercase tracking-wide rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-xs text-gn-muted">
            {game._count.reviews} reseñas
          </span>
          {!game.userReview && (
            <span className="text-[10px] text-gn-subtle uppercase tracking-wide">
              Sin reseña
            </span>
          )}
          {game.userReview?.content && (
            <span className="text-[10px] text-gn-subtle truncate max-w-[100px]">
              ✍ Reseñado
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function CollectionTabs({ grouped }: { grouped: Grouped }) {
  const [active, setActive] = useState<keyof Grouped>('PLAYING')

  const games = grouped[active]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-white/[0.06] mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const count    = grouped[tab.key].length
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase
                          tracking-wider border-b-2 transition-all duration-150 whitespace-nowrap
                          ${isActive
                            ? `${tab.active} border-b-2`
                            : 'border-transparent text-gn-muted hover:text-gn-text'
                          }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black
                                ${isActive ? 'bg-white/10' : 'bg-white/[0.04]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {games.length === 0 ? (
        <div className="text-center py-16 text-gn-muted">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm">No tienes juegos en esta categoría todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {games.map(entry => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}