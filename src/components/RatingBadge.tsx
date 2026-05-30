'use client'

import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'
import { getRatingData } from '@/lib/rating'

const ICON_MAP = { Sword, Heart, Shield, Medal, Trophy, Crown } as const

export function RatingBadge({ rating, size = 20 }: { rating: number; size?: number }) {
  const { iconName, color } = getRatingData(rating)
  const icon = ICON_MAP[iconName as keyof typeof ICON_MAP]

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
      style={{
        background:  `${color}12`,
        borderColor: `${color}35`,
      }}
    >
      <PxlKitIcon icon={icon} size={size} />
      <span
        className="font-display font-black text-sm"
        style={{ color, fontFamily: 'Orbitron, monospace' }}
      >
        {rating}
      </span>
    </div>
  )
}

export function RatingDisplay({ rating }: { rating: number }) {
  const { iconName, label } = getRatingData(rating)
  const icon = ICON_MAP[iconName as keyof typeof ICON_MAP]

  return (
    <div className="flex items-center gap-2">
      <PxlKitIcon icon={icon} size={16} />
      <span className="font-medium text-sm text-gn-text">{rating}/10</span>
      <span className="text-xs text-gn-muted">{label}</span>
    </div>
  )
}