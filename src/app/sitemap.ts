// src/app/sitemap.ts

import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://gamenook.es'

  // ── Páginas estáticas ────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             `${baseUrl}/`,
      lastModified:    new Date(),
      changeFrequency: 'daily',    // la home cambia con nuevas reseñas y juegos
      priority:        1.0,
    },
    {
      url:             `${baseUrl}/games`,
      lastModified:    new Date(),
      changeFrequency: 'daily',    // se añaden juegos frecuentemente
      priority:        0.9,
    },
  ]

  // ── Páginas dinámicas — una por juego aprobado ───────────────────────
  // Solo traemos slug y updatedAt — lo mínimo necesario, sin cargar
  // relaciones ni campos pesados.
  const games = await prisma.game.findMany({
    where:  { status: 'APPROVED' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const gameRoutes: MetadataRoute.Sitemap = games.map(game => ({
    url:             `${baseUrl}/games/${game.slug}`,
    lastModified:    game.updatedAt,   // fecha real del último cambio en BD
    changeFrequency: 'weekly',         // las reseñas llegan, pero no a diario
    priority:        0.8,
  }))

  return [...staticRoutes, ...gameRoutes]
}