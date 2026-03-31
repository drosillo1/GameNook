// src/lib/igdb.ts
interface TwitchToken {
  access_token: string
  expires_at:   number
}

let cachedToken: TwitchToken | null = null

async function getTwitchToken(): Promise<string> {
  // Si el token existe y no ha expirado (con 5min de margen) lo reutilizamos
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

// Función base para llamar a IGDB
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
  id:           number
  name:         string
  slug:         string
  summary?:     string
  cover?:       { id: number; url: string }
  first_release_date?: number   // Unix timestamp
  genres?:      { id: number; name: string }[]
  platforms?:   { id: number; name: string }[]
  rating?:      number
  rating_count?: number
}

// ── Queries públicas ───────────────────────────────────────────

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

  // Convertir URL de portada a alta resolución
  return (data as IGDBGame[]).map(game => ({
    ...game,
    cover: game.cover
      ? { ...game.cover, url: game.cover.url.replace('t_thumb', 't_cover_big') }
      : undefined,
  }))
}

// Obtener un juego por ID (para autocompletar todos los datos)
export async function getIGDBGameById(id: number): Promise<IGDBGame | null> {
  const data = await igdbFetch(
    'games',
    `
      fields name, slug, summary, cover.url, first_release_date,
             genres.name, platforms.name, rating, rating_count;
      where id = ${id};
      limit 1;
    `
  )

  const game = (data as IGDBGame[])[0]
  if (!game) return null

  return {
    ...game,
    cover: game.cover
      ? { ...game.cover, url: game.cover.url.replace('t_thumb', 't_cover_big') }
      : undefined,
  }
}