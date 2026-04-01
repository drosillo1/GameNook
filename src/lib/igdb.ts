// src/lib/igdb.ts
interface TwitchToken {
  access_token: string
  expires_at:   number
}

let cachedToken: TwitchToken | null = null

function normalizeImageUrl(url: string, size: string): string {
  // Quita protocolo existente y añade https siempre
  const clean = url.replace(/^https?:/, '').replace(/^\/\//, '')
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
}

// Buscar juegos por nombre
export async function searchIGDBGames(query: string): Promise<IGDBGame[]> {
  const data = await igdbFetch(
    'games',
    `
      search "${query}";
      fields name, slug, summary, cover.url, first_release_date,
             genres.name, platforms.name, rating, rating_count;
      where version_parent = null;
      limit 8;
    `
  )
  return (data as IGDBGame[]).map(game => ({
    ...game,
    cover: game.cover
      ? { ...game.cover, url: normalizeImageUrl(game.cover.url, 't_cover_big') }
      : undefined,
  }))
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
             rating, rating_count;
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