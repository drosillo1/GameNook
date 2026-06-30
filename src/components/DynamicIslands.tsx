'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Solo se pide el chunk de HeroCharacters cuando el viewport es >= md (768px).
const HeroCharactersInner = dynamic(
  () => import('@/components/HeroCharacters'),
  { ssr: false }
)

export function HeroCharacters() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  if (!isDesktop) return null
  return <HeroCharactersInner />
}

export const RecentReviews = dynamic(
  () => import('@/components/RecentReviews'),
  { ssr: true }
)