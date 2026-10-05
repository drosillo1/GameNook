// src/lib/cacheTags.ts
import 'server-only'
import { revalidateTag } from 'next/cache'


export const CACHE_TAGS = {
  HOME_STATS:     'home-stats',
  RECENT_REVIEWS: 'recent-reviews',
} as const

/**
 * Invalida los datos cacheados de la home (contadores + carrusel de reseñas).
 */
export function revalidateHome() {
  revalidateTag(CACHE_TAGS.HOME_STATS)
  revalidateTag(CACHE_TAGS.RECENT_REVIEWS)
}