'use client'

import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'

const IconIcons = {
  1:  Sword,
  2:  Sword,
  3:  Heart,
  4:  Heart,
  5:  Shield,
  6:  Shield,
  7:  Medal,
  8:  Medal,
  9:  Trophy,
  10: Crown,
} as const

const RATING_META = {
  1:  { label: 'Jugable',        color: '#6b7280' },
  2:  { label: 'Jugable',        color: '#6b7280' },
  3:  { label: 'Entretenido',    color: '#3b82f6' },
  4:  { label: 'Entretenido',    color: '#3b82f6' },
  5:  { label: 'Recomendado',    color: '#a855f7' },
  6:  { label: 'Recomendado',    color: '#a855f7' },
  7:  { label: 'Muy Bueno',      color: '#06b6d4' },
  8:  { label: 'Muy Bueno',      color: '#06b6d4' },
  9:  { label: 'Imprescindible', color: '#f97316' },
  10: { label: 'Obra Maestra',   color: '#fbbf24' },
} as const

export function RatingBadge({ rating, size = 20 }: { rating: number; size?: number }) {
  const meta = RATING_META[rating as keyof typeof RATING_META]
  const iconData = IconIcons[rating as keyof typeof IconIcons]

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
      style={{
        background: `${meta.color}12`,
        borderColor: `${meta.color}35`,
      }}
    >
      <PxlKitIcon icon={iconData} size={size} />
      <span
        className="font-display font-black text-sm"
        style={{
          color: meta.color,
          fontFamily: 'Orbitron, monospace',
        }}
      >
        {rating}
      </span>
    </div>
  )
}

export function RatingDisplay({ rating }: { rating: number }) {
  const meta = RATING_META[rating as keyof typeof RATING_META]
  const iconData = IconIcons[rating as keyof typeof IconIcons]

  return (
    <div className="flex items-center gap-2">
      <PxlKitIcon icon={iconData} size={16} />
      <span className="font-medium text-sm text-gn-text">{rating}/10</span>
      <span className="text-xs text-gn-muted">{meta.label}</span>
    </div>
  )
}
