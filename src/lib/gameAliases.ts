// src/lib/gameAliases.ts
//
// Mapa de acrónimos/alias comunes -> término de búsqueda real.

export const GAME_ALIASES: Record<string, string[]> = {
  gta:    ['grand theft auto'],
  re:     ['resident evil'],
  re2:    ['resident evil 2'],
  re3:    ['resident evil 3'],
  re4:    ['resident evil 4'],
  ff:     ['final fantasy'],
  ff7:    ['final fantasy vii'],
  cod:    ['call of duty'],
  mw:     ['modern warfare'],
  botw:   ['breath of the wild'],
  totk:   ['tears of the kingdom'],
  rdr:    ['red dead redemption'],
  rdr2:   ['red dead redemption 2'],
  tlou:   ['the last of us'],
  ac:     ['assassin\'s creed'],
  ow:     ['overwatch'],
  lol:    ['league of legends'],
  csgo:   ['counter-strike'],
  cs2:    ['counter-strike 2'],
  dmc:    ['devil may cry'],
  mgs:    ['metal gear solid'],
  ds:     ['dark souls'],
  er:     ['elden ring'],
  bg3:    ['baldur\'s gate 3'],
  p5:     ['persona 5'],
  ssbu:   ['super smash bros ultimate'],
  smash:  ['super smash bros'],
  wow:    ['world of warcraft'],
  fifa:   ['fifa'],
  nba2k:  ['nba 2k'],
  gow:    ['god of war'],
  hzd:    ['horizon zero dawn'],
  hfw:    ['horizon forbidden west'],
  tw3:    ['the witcher 3'],
  ac6:    ['armored core 6'],
}

/**
 * Dado un término de búsqueda, devuelve los términos extra a añadir
 * (alias resueltos) si el término coincide con alguna clave conocida.
 * La comparación es case-insensitive y exacta sobre la clave completa
 * (ej. "gta" coincide, "gtav" no) para evitar falsos positivos.
 */
export function resolveGameAlias(query: string): string[] {
  const key = query.trim().toLowerCase()
  return GAME_ALIASES[key] ?? []
}