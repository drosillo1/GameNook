'use client'

import dynamic from 'next/dynamic'

export const HeroCharacters = dynamic(
  () => import('@/components/HeroCharacters'),
  { ssr: false }
)

export const RecentReviews = dynamic(
  () => import('@/components/RecentReviews'),
  { ssr: false }
)