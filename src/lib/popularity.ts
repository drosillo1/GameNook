// src/lib/popularity.ts


export function popularityScore(game: {
  igdbRating: number | null
  igdbRatingCount: number | null
  releaseDate: Date | string | null
}): number {
  const rating = game.igdbRating      ?? 0
  const count  = game.igdbRatingCount ?? 0
  const now    = Date.now()

  const qualityScore = rating / 100
  const popRaw       = count > 0 ? Math.log10(count + 1) : 0
  const popScore      = Math.min(popRaw / 5, 1)

  let recencyScore = 0.5
  let monthsOld    = 999
  if (game.releaseDate) {
    const releaseTime = new Date(game.releaseDate).getTime()
    const ageYears     = (now - releaseTime) / (1000 * 60 * 60 * 24 * 365)
    recencyScore       = 1 / (1 + ageYears * 0.08)
    monthsOld          = ageYears * 12
  }

  const newGameBoost = monthsOld < 3 ? 1.4 : monthsOld < 6 ? 1.2 : 1.0

  return ((qualityScore * 0.40) + (popScore * 0.35) + (recencyScore * 0.25)) * newGameBoost
}