// src/lib/platforms.ts

// Lista acotada de plataformas para el selector de "plataformas favoritas" en el perfil.
// Nota: 'PC' aquí es una simplificación legible — no coincide literalmente con el string
// 'PC (Microsoft Windows)' usado en Game.platform[], ya que este campo es solo descriptivo
// del perfil del usuario, no se cruza con filtros del catálogo.
export const FAVORITE_PLATFORMS = [
  'PlayStation 5',
  'Xbox Series X|S',
  'PC',
  'Nintendo Switch',
  'Nintendo Switch 2',
  'PlayStation 4',
  'Xbox One',
  'Nintendo 3DS',
  'PlayStation Vita',
  'Android',
  'iOS',
  'Mac',
] as const

export type FavoritePlatform = typeof FAVORITE_PLATFORMS[number]

export const MAX_FAVORITE_PLATFORMS = 3

export function isValidFavoritePlatform(value: string): value is FavoritePlatform {
  return FAVORITE_PLATFORMS.includes(value as FavoritePlatform)
}