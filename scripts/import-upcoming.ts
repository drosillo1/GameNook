// scripts/import-upcoming.ts
//
// Importa juegos próximos desde IGDB (fecha futura + cover).
// Uso:
//   npx tsx scripts/import-upcoming.ts
//   $env:DATABASE_URL="postgres://..."; npx tsx scripts/import-upcoming.ts   (producción)
//
// Requisitos: TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET en .env (o como env vars).

import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

// ── Helpers IGDB (autocontenidos, no dependen de src/lib) ──

interface TwitchToken { access_token: string; expires_at: number }
let cachedToken: TwitchToken | null = null

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

async function igdbFetch(endpoint: string, body: string): Promise<any[]> {
  const token = await getTwitchToken()
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID':     process.env.TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'text/plain',
    },
    body,
  })
  if (!res.ok) throw new Error(`IGDB error ${res.status}: ${await res.text()}`)
  return res.json()
}

function normalizeImageUrl(url: string, size: string): string {
  if (!url) return ''
  const clean = url.replace(/^https?:\/\//, '').replace(/^\/\//, '')
  return `https://${clean}`.replace('t_thumb', size)
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.game.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Campos completos para detalle (mismos que getIGDBGameDetails) ──

const DETAIL_FIELDS = `
  fields name, slug, summary, cover.url,
    screenshots.url,
    first_release_date,
    genres.name,
    platforms.name,
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
    similar_games.id,
    status;
`

// ── mapIGDBToDBFields (replica de src/lib/igdb.ts) ──

function mapIGDBToDBFields(game: any) {
  return {
    themes:             (game.themes ?? []).map((t: any) => t.name),
    playerPerspectives: (game.player_perspectives ?? []).map((p: any) => p.name),
    multiplayerInfo:    game.multiplayer_modes && game.multiplayer_modes.length > 0
      ? game.multiplayer_modes.map((m: any) => ({
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
      ? game.age_ratings.map((ar: any) => ({
          category: ar.category,
          rating:   ar.rating,
        }))
      : undefined,
    languageSupports:   game.language_supports && game.language_supports.length > 0
      ? game.language_supports.map((ls: any) => ({
          language: ls.language.name,
          type:     ls.language_support_type.name,
        }))
      : undefined,
    gameEngine:         game.game_engines?.[0]?.name ?? null,
    websites:           game.websites && game.websites.length > 0
      ? game.websites.map((w: any) => ({
          category: w.category,
          url:      w.url,
        }))
      : undefined,
    youtubeVideoIds:    (game.videos ?? []).map((v: any) => v.video_id),
    dlcIgdbIds:         [...(game.dlcs ?? []), ...(game.expansions ?? [])],
    similarGameIgdbIds: (game.similar_games ?? []).map((sg: any) => sg.id),
    releaseStatus:      game.status ?? null,
  }
}

// ── Main ──

async function main() {
  const nowUnix = Math.floor(Date.now() / 1000)

  console.log('🔍 Buscando juegos próximos en IGDB...\n')

  // Juegos con fecha futura, ordenados por fecha
  const upcoming = await igdbFetch('games', `
    ${DETAIL_FIELDS}
    where first_release_date > ${nowUnix}
      & version_parent = null
      & cover != null
      & category = 0;
    sort first_release_date asc;
    limit 100;
  `)

  console.log(`  → ${upcoming.length} juegos con fecha futura encontrados`)

  // Deduplicar por ID (por si acaso)
  const seen = new Set<number>()
  const allGames = upcoming.filter((g: any) => {
    if (seen.has(g.id)) return false
    seen.add(g.id)
    return true
  })

  console.log(`  → ${allGames.length} juegos únicos en total\n`)

  // Comprobar cuáles ya existen en BD
  const igdbIds = allGames.map((g: any) => g.id)
  const existing = await prisma.game.findMany({
    where: { igdbId: { in: igdbIds } },
    select: { igdbId: true },
  })
  const existingSet = new Set(existing.map(g => g.igdbId))

  const newGames = allGames.filter((g: any) => !existingSet.has(g.id))
  console.log(`  → ${existing.length} ya existían en BD`)
  console.log(`  → ${newGames.length} nuevos por importar\n`)

  if (newGames.length === 0) {
    console.log('✅ No hay juegos nuevos que importar.')
    return
  }

  let created = 0
  let errors  = 0

  for (const game of newGames) {
    try {
      const title    = game.name
      const slug     = await ensureUniqueSlug(generateSlug(title))
      const imageUrl = game.cover?.url
        ? normalizeImageUrl(game.cover.url, 't_cover_big')
        : null

      const enriched = mapIGDBToDBFields(game)

      await prisma.game.create({
        data: {
          title,
          slug,
          description:         game.summary ?? null,
          imageUrl,
          releaseDate:         game.first_release_date
            ? new Date(game.first_release_date * 1000)
            : null,
          genre:               (game.genres ?? []).map((g: any) => g.name),
          platform:            (game.platforms ?? []).map((p: any) => p.name),
          igdbId:              game.id,
          status:              'APPROVED',
          igdbRating:          game.rating ?? null,
          igdbRatingCount:     game.rating_count ?? null,
          ...enriched,
        },
      })

      created++
      console.log(`  ✅ ${title}`)
    } catch (err: any) {
      errors++
      console.error(`  ❌ ${game.name}: ${err.message}`)
    }

    // Rate limit IGDB: 4 req/s → 260ms entre llamadas
    await sleep(260)
  }

  console.log(`\n🏁 Importación completada: ${created} creados, ${errors} errores`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())