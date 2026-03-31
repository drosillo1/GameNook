'use client'

import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'

const IconMap = {
  Sword:  Sword,
  Heart:  Heart,
  Shield: Shield,
  Medal:  Medal,
  Trophy: Trophy,
  Crown:  Crown,
} as const

export function RatingIcon({ iconName, size = 20 }: { iconName: keyof typeof IconMap; size?: number }) {
  const Icon = IconMap[iconName]
  return <PxlKitIcon icon={Icon} size={size} />
}
