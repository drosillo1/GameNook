// src/lib/profileStats.ts

interface CollectionGameForStats {
  game: {
    genre: string[]
  }
}

interface ReviewForStats {
  createdAt: Date | string
}

/**
 * Calcula los géneros más frecuentes a partir de toda la colección del usuario
 * (incluye juegos en cualquier estado: jugando, completado, pendiente, abandonado).
 * Devuelve hasta `limit` géneros ordenados por frecuencia descendente.
 */
export function getTopGenres(
  collection: CollectionGameForStats[],
  limit = 3
): { genre: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const item of collection) {
    for (const genre of item.game.genre) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Cuenta cuántas reseñas ha escrito el usuario en el año actual.
 * Métrica de actividad simple — evita "racha de días consecutivos",
 * poco realista para algo tan poco frecuente como completar y reseñar un juego.
 */
export function getReviewsThisYear(reviews: ReviewForStats[]): number {
  const currentYear = new Date().getFullYear()
  return reviews.filter(r => new Date(r.createdAt).getFullYear() === currentYear).length
}