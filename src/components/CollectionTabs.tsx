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

// Metadata centralizada por estado — la usan tanto los tabs como el badge
// de cada card, para que ambos hablen el mismo idioma visual.
const STATUS_META = {
  PLAYING: {
    label: 'Jugando',
    icon: <PlayIcon className="w-3.5 h-3.5" />,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  COMPLETED: {
    label: 'Completado',
    icon: <CheckIcon className="w-3.5 h-3.5" />,
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  WANT_TO_PLAY: {
    label: 'Pendiente',
    icon: <ClockIcon className="w-3.5 h-3.5" />,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  DROPPED: {
    label: 'Abandonado',
    icon: <XIcon className="w-3.5 h-3.5" />,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
} as const

const TAB_PLURALS: Record<keyof Grouped, string> = {
  PLAYING: 'Jugando',
  COMPLETED: 'Completados',
  WANT_TO_PLAY: 'Pendientes',
  DROPPED: 'Abandonados',
}

const TABS = (Object.keys(STATUS_META) as (keyof Grouped)[]).map(key => ({
  key,
  ...STATUS_META[key],
}))

function getRatingMeta(rating: number) {
  if (rating === 10) return { iconName: 'Crown' as const,  color: '#fbbf24' }
  if (rating === 9)  return { iconName: 'Trophy' as const, color: '#f97316' }
  if (rating >= 7)   return { iconName: 'Medal' as const,  color: '#06b6d4' }
  if (rating >= 5)   return { iconName: 'Shield' as const, color: '#a855f7' }
  if (rating >= 3)   return { iconName: 'Heart' as const,  color: '#3b82f6' }
  return               { iconName: 'Sword' as const,  color: '#6b7280' }
}

function GameCard({ entry, statusKey }: { entry: CollectionEntry; statusKey: keyof Grouped }) {
  const { game } = entry
  const ratingMeta = game.userReview ? getRatingMeta(game.userReview.rating) : null
  const status = STATUS_META[statusKey]

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden
                 hover:border-gn-primary/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(230,57,70,0.25)]
                 transition-all duration-200 flex flex-col"
    >
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

        {/* Gradiente inferior para que el título destaque sobre la imagen */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Badge de estado — esquina superior izquierda, color por estado */}
        <div
          className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1
                     rounded-md border text-[10px] font-bold uppercase tracking-wide
                     backdrop-blur-sm ${status.bg} ${status.border} ${status.text}`}
        >
          {status.icon}
          {status.label}
        </div>

        {/* Badge de rating — esquina superior derecha, igual que en el catálogo */}
        {ratingMeta && game.userReview && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                       rounded-md border text-xs font-bold backdrop-blur-sm bg-gn-bg/80"
            style={{ borderColor: `${ratingMeta.color}40`, color: ratingMeta.color }}
          >
            <RatingIcon iconName={ratingMeta.iconName} size={14} />
            <span style={{ fontFamily: 'Orbitron, monospace' }}>
              {game.userReview.rating}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-sm text-gn-text truncate
                       group-hover:text-gn-primary transition-colors mb-1.5">
          {game.title}
        </h3>

        {game.genre.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
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

        <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-gn-muted">
            {game._count.reviews} {game._count.reviews === 1 ? 'reseña' : 'reseñas'}
          </span>

          {game.userReview?.content ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase
                             tracking-wide text-gn-primary/80">
              ✍ Reseñado
            </span>
          ) : game.userReview ? (
            <span className="text-[10px] text-gn-subtle uppercase tracking-wide">
              Sin texto
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px]
                             text-gn-subtle uppercase tracking-wide">
              Sin reseña
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function CollectionTabs({ grouped, initialTab }: {
  grouped: Grouped
  initialTab?: keyof Grouped
}) {
  const [active, setActive] = useState<keyof Grouped>(initialTab ?? 'PLAYING')

  const games = grouped[active]

  return (
    <div>
      {/* Stat cards — ahora son botones que cambian el tab activo sin
          recargar la página (antes eran <Link href="?tab=..."> que
          forzaban una navegación completa). */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TABS.map(tab => {
          const count    = grouped[tab.key].length
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`${tab.bg} border rounded-xl p-4 text-left transition-all
                         ${isActive ? `${tab.border} ring-1 ring-inset ${tab.border}` : 'border-white/[0.06] hover:brightness-125'}`}
            >
              <div className={`font-display font-black text-3xl ${tab.text}`}>{count}</div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-1">
                {TAB_PLURALS[tab.key]}
              </div>
            </button>
          )
        })}
      </div>

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
                            ? `${tab.text} border-current`
                            : 'border-transparent text-gn-muted hover:text-gn-text'
                          }`}
            >
              {tab.icon}
              {TAB_PLURALS[tab.key]}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black
                                ${isActive ? `${tab.bg} ${tab.text}` : 'bg-white/[0.04] text-gn-muted'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16 text-gn-muted">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm">No tienes juegos en esta categoría todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {games.map(entry => (
            <GameCard key={entry.id} entry={entry} statusKey={active} />
          ))}
        </div>
      )}
    </div>
  )
}