// src/app/sitemap.ts

import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Páginas estáticas ────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             `${SITE_URL}/`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${SITE_URL}/games`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${SITE_URL}/upcoming`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',   // depende de import-upcoming.ts, que es manual
      priority:        0.7,
    },
  ]

  // ── Fichas de juego ──────────────────────────────────────────────────

  const games = await prisma.game.findMany({
    where:  { status: 'APPROVED' },
    select: {
      slug:      true,
      createdAt: true,
      reviews: {
        select:  { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take:    1,
      },
    },
  })

  const gameRoutes: MetadataRoute.Sitemap = games.map(game => ({
    url:             `${SITE_URL}/games/${game.slug}`,
    lastModified:    game.reviews[0]?.createdAt ?? game.createdAt,
    changeFrequency: 'weekly',
    priority:        0.8,
  }))


  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      reviews:  { some: {} },
    },
    select: { username: true, updatedAt: true },
  })

  const profileRoutes: MetadataRoute.Sitemap = users.map(user => ({
    url:             `${SITE_URL}/profile/${user.username}`,
    lastModified:    user.updatedAt,   // aquí sí es fiable: User no se toca por lotes
    changeFrequency: 'weekly',
    priority:        0.6,
  }))

  return [...staticRoutes, ...gameRoutes, ...profileRoutes]
}