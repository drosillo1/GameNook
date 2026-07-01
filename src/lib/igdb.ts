// src/lib/igdb.ts
interface TwitchToken {
  access_token: string
  expires_at:   number
}

let cachedToken: TwitchToken | null = null


function normalizeImageUrl(url: string, size: string): string {
  if (!url) return ''

  // Quitar cualquier protocolo existente y slashes iniciales
  const clean = url
    .replace(/^https?:\/\//, '')  // quita "https://" o "http://"
    .replace(/^\/\//, '')          // quita "//"

  return `https://${clean}`.replace('t_thumb', size)
}

async function getTwitchToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at - 300_000) {
    return cachedToken.access_token
  }
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type:    'client_credentials',
    }),
  })
  if (!res.ok) throw new Error('Error obteniendo token de Twitch')
  const data = await res.json()
  cachedToken = {
    access_token: data.access_token,
    expires_at:   Date.now() + data.expires_in * 1000,
  }
  return cachedToken.access_token
}

async function igdbFetch(endpoint: string, body: string) {
  const token = await getTwitchToken()
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method:  'POST',
    headers: {
      'Client-ID':     process.env.TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'text/plain',
    },
    body,
  })
  if (!res.ok) throw new Error(`IGDB error ${res.status}`)
  return res.json()
}

// ── Tipos ──────────────────────────────────────────────────────

export interface IGDBMultiplayerMode {
  onlinemax?:      number
  offlinemax?:     number
  onlinecoopmax?:  number
  offlinecoopmax?: number
  campaigncoop?:   boolean
  lancoop?:        boolean
  onlinecoop?:     boolean
  offlinecoop?:    boolean
  splitscreen?:    boolean
  platform?:       { id: number; name: string }
}

export interface IGDBAgeRating {
  category: number  // 1=ESRB, 2=PEGI
  rating:   number  // valor numérico del rating dentro de su categoría
}

export interface IGDBLanguageSupport {
  language:              { id: number; name: string }
  language_support_type: { id: number; name: string }  // "Audio", "Subtitles", "Interface"
}

export interface IGDBWebsite {
  category: number  // 1=official, 13=Steam, 16=Epic, 17=GOG, 15=Reddit, etc.
  url:      string
}

export interface IGDBVideo {
  video_id: string  // YouTube video ID
  name?:    string
}

export interface IGDBGame {
  id:                  number
  name:                string
  slug:                string
  summary?:            string
  cover?:              { id: number; url: string }
  screenshots?:        { id: number; url: string }[]
  first_release_date?: number
  genres?:             { id: number; name: string }[]
  platforms?:          { id: number; name: string }[]
  game_modes?:         { id: number; name: string }[]
  involved_companies?: {
    id:       number
    company:  { id: number; name: string }
    developer: boolean
    publisher: boolean
  }[]
  similar_games?:      {
    id:     number
    name:   string
    slug:   string
    cover?: { id: number; url: string }
    genres?:{ id: number; name: string }[]
  }[]
  collection?: { id: number; name: string }
  franchises?: { id: number; name: string }[]
  rating?:      number
  rating_count?: number

  // ── Nuevos campos enriquecidos ──
  themes?:              { id: number; name: string }[]
  player_perspectives?: { id: number; name: string }[]
  multiplayer_modes?:   IGDBMultiplayerMode[]
  age_ratings?:         IGDBAgeRating[]
  language_supports?:   IGDBLanguageSupport[]
  game_engines?:        { id: number; name: string }[]
  websites?:            IGDBWebsite[]
  videos?:              IGDBVideo[]
  dlcs?:                number[]
  expansions?:          number[]
  status?:              number  // 0=released, 2=alpha, 3=beta, 4=early_access, 7=rumoured...
}

// ── Mapeo de categoría de website IGDB → label legible ──
export const WEBSITE_CATEGORY_LABELS: Record<number, string> = {
  1:  'Oficial',
  2:  'Wikia',
  3:  'Wikipedia',
  4:  'Facebook',
  5:  'Twitter',
  6:  'Twitch',
  8:  'Instagram',
  9:  'YouTube',
  10: 'iPhone',
  11: 'iPad',
  12: 'Android',
  13: 'Steam',
  14: 'Reddit',
  15: 'Itch.io',
  16: 'Epic Games',
  17: 'GOG',
  18: 'Discord',
}

// Categorías de tienda (para el bloque "Dónde comprarlo")
export const STORE_WEBSITE_CATEGORIES = [1, 13, 16, 17, 15, 10, 11, 12]
// 1=Oficial, 13=Steam, 16=Epic, 17=GOG, 15=Itch.io, 10=iPhone, 11=iPad, 12=Android

// ── Mapeo de age rating IGDB → label legible ──
// Categoría 1 = ESRB, Categoría 2 = PEGI
export const PEGI_RATING_LABELS: Record<number, string> = {
  1: 'PEGI 3',
  2: 'PEGI 7',
  3: 'PEGI 12',
  4: 'PEGI 16',
  5: 'PEGI 18',
}

export const ESRB_RATING_LABELS: Record<number, string> = {
  1:  'RP (Rating Pending)',
  2:  'EC (Early Childhood)',
  3:  'E (Everyone)',
  4:  'E10+ (Everyone 10+)',
  5:  'T (Teen)',
  6:  'M (Mature 17+)',
  7:  'AO (Adults Only)',
}

// ── Búsqueda — más recientes primero ──
// Pedimos más a IGDB y reordenamos en JS (el endpoint `search` ignora `sort`).
// DLCs y expansiones aparecen como juegos normales — se pueden dar de alta y reseñar.
const IGDB_SEARCH_FETCH = 20
const IGDB_SEARCH_RETURN = 8

export async function searchIGDBGames(query: string): Promise<IGDBGame[]> {
  const data = await igdbFetch(
    'games',
    `
      search "${query}";
      fields name, slug, summary, cover.url, first_release_date,
             genres.name, platforms.name, rating, rating_count;
      where version_parent = null & cover != null;
      limit ${IGDB_SEARCH_FETCH};
    `
  )

  const games = (data as IGDBGame[])
    .map(game => ({
      ...game,
      cover: game.cover
        ? { ...game.cover, url: normalizeImageUrl(game.cover.url, 't_cover_big') }
        : undefined,
    }))
    // Más recientes primero — juegos sin fecha van al final
    .sort((a, b) => (b.first_release_date ?? 0) - (a.first_release_date ?? 0))
    .slice(0, IGDB_SEARCH_RETURN)

  return games
}

// ── IDs de DLCs/expansiones de un juego base (desde IGDB) ──
export async function getIGDBRelatedDLCIds(igdbId: number): Promise<number[]> {
  try {
    const data = await igdbFetch(
      'games',
      `
        fields dlcs, expansions;
        where id = ${igdbId};
        limit 1;
      `
    )

    const game = (data as any[])[0]
    if (!game) return []

    const dlcIds:       number[] = game.dlcs ?? []
    const expansionIds: number[] = game.expansions ?? []

    return [...dlcIds, ...expansionIds]
  } catch {
    return []
  }
}

export async function getIGDBGameDetails(igdbId: number): Promise<IGDBGame | null> {
  const data = await igdbFetch(
    'games',
    `
      fields name, slug, summary, cover.url,
             screenshots.url,
             first_release_date,
             genres.name,
             platforms.name,
             game_modes.name,
             involved_companies.company.name,
             involved_companies.developer,
             involved_companies.publisher,
             similar_games.name,
             similar_games.slug,
             similar_games.cover.url,
             similar_games.genres.name,
             collection.name,
             franchises.name,
             rating, rating_count,
             themes.name,
             player_perspectives.name,
             multiplayer_modes.onlinemax,
             multiplayer_modes.offlinemax,
             multiplayer_modes.onlinecoopmax,
             multiplayer_modes.offlinecoopmax,
             multiplayer_modes.campaigncoop,
             multiplayer_modes.lancoop,
             multiplayer_modes.onlinecoop,
             multiplayer_modes.offlinecoop,
             multiplayer_modes.splitscreen,
             multiplayer_modes.platform.name,
             age_ratings.category,
             age_ratings.rating,
             language_supports.language.name,
             language_supports.language_support_type.name,
             game_engines.name,
             websites.category,
             websites.url,
             videos.video_id,
             videos.name,
             dlcs,
             expansions,
             status;
      where id = ${igdbId};
      limit 1;
    `
  )

  const game = (data as IGDBGame[])[0]
  if (!game) return null

  return {
    ...game,
    cover: game.cover
      ? { ...game.cover, url: normalizeImageUrl(game.cover.url, 't_cover_big') }
      : undefined,
    screenshots: (game.screenshots ?? []).map(s => ({
      ...s,
      url: normalizeImageUrl(s.url, 't_screenshot_big'),
    })),
    similar_games: (game.similar_games ?? []).map(sg => ({
      ...sg,
      cover: sg.cover
        ? { ...sg.cover, url: normalizeImageUrl(sg.cover.url, 't_cover_big') }
        : undefined,
    })),
  }
}

export async function getIGDBGameById(id: number): Promise<IGDBGame | null> {
  return getIGDBGameDetails(id)
}

// ── Helper: extraer datos para guardar en BD ──
// Transforma la respuesta de IGDB al formato que espera Prisma
export function mapIGDBToDBFields(game: IGDBGame) {
  return {
    themes:             (game.themes ?? []).map(t => t.name),
    playerPerspectives: (game.player_perspectives ?? []).map(p => p.name),
    multiplayerInfo:    game.multiplayer_modes && game.multiplayer_modes.length > 0
      ? game.multiplayer_modes.map(m => ({
          onlineMax:      m.onlinemax ?? 0,
          offlineMax:     m.offlinemax ?? 0,
          onlineCoopMax:  m.onlinecoopmax ?? 0,
          offlineCoopMax: m.offlinecoopmax ?? 0,
          campaignCoop:   m.campaigncoop ?? false,
          lanCoop:        m.lancoop ?? false,
          onlineCoop:     m.onlinecoop ?? false,
          offlineCoop:    m.offlinecoop ?? false,
          splitscreen:    m.splitscreen ?? false,
          platform:       m.platform?.name ?? null,
        }))
      : undefined,
    ageRatings:         game.age_ratings && game.age_ratings.length > 0
      ? game.age_ratings.map(ar => ({
          category: ar.category,  // 1=ESRB, 2=PEGI
          rating:   ar.rating,
        }))
      : undefined,
    languageSupports:   game.language_supports && game.language_supports.length > 0
      ? game.language_supports.map(ls => ({
          language: ls.language.name,
          type:     ls.language_support_type.name,
        }))
      : undefined,
    gameEngine:         game.game_engines?.[0]?.name ?? null,
    websites:           game.websites && game.websites.length > 0
      ? game.websites.map(w => ({
          category: w.category,
          url:      w.url,
        }))
      : undefined,
    youtubeVideoIds:    (game.videos ?? []).map(v => v.video_id),
    dlcIgdbIds:         [...(game.dlcs ?? []), ...(game.expansions ?? [])],
    similarGameIgdbIds: (game.similar_games ?? []).map(sg => sg.id),
    releaseStatus:      game.status ?? null,
  }
}