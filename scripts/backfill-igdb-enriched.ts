// scripts/backfill-igdb-enriched.ts
// Uso: npx tsx scripts/backfill-igdb-enriched.ts
//
// Recorre todos los juegos con igdbId, consulta los datos enriquecidos
// de IGDB y actualiza los campos nuevos en la BD.
// Seguro de re-ejecutar: sobreescribe los campos cada vez.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Reproducimos la lógica de igdb.ts sin imports de Next.js ──

interface TwitchToken {
  access_token: string
  expires_at:   number
}

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

async function fetchEnrichedData(igdbId: number) {
  const data = await igdbFetch(
    'games',
    `
      fields themes.name,
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
             similar_games,
             status;
      where id = ${igdbId};
      limit 1;
    `
  )

  const game = (data as any[])[0]
  if (!game) return null

  return {
    themes:             (game.themes ?? []).map((t: any) => t.name),
    playerPerspectives: (game.player_perspectives ?? []).map((p: any) => p.name),
    multiplayerInfo:    game.multiplayer_modes?.length > 0
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
    ageRatings:         game.age_ratings?.length > 0
      ? game.age_ratings.map((ar: any) => ({
          category: ar.category,
          rating:   ar.rating,
        }))
      : undefined,
    languageSupports:   game.language_supports?.length > 0
      ? game.language_supports.map((ls: any) => ({
          language: ls.language.name,
          type:     ls.language_support_type.name,
        }))
      : undefined,
    gameEngine:         game.game_engines?.[0]?.name ?? null,
    websites:           game.websites?.length > 0
      ? game.websites.map((w: any) => ({
          category: w.category,
          url:      w.url,
        }))
      : undefined,
    youtubeVideoIds:    (game.videos ?? []).map((v: any) => v.video_id),
    dlcIgdbIds:         [...(game.dlcs ?? []), ...(game.expansions ?? [])],
    similarGameIgdbIds: (game.similar_games ?? []).map((sg: any) =>
      typeof sg === 'number' ? sg : sg.id
    ),
    releaseStatus:      game.status ?? null,
  }
}

// ── Rate limit: IGDB permite ~4 requests/segundo ──
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const games = await prisma.game.findMany({
    where: { igdbId: { not: null } },
    select: { id: true, title: true, igdbId: true },
    orderBy: { title: 'asc' },
  })

  console.log(`Encontrados ${games.length} juegos con igdbId\n`)

  let updated = 0
  let skipped = 0
  let errors  = 0

  for (const game of games) {
    try {
      const data = await fetchEnrichedData(game.igdbId!)
      if (!data) {
        console.log(`⏭️  ${game.title} — no encontrado en IGDB (id: ${game.igdbId})`)
        skipped++
        continue
      }

      await prisma.game.update({
        where: { id: game.id },
        data,
      })

      const extras = [
        data.themes.length > 0           && `${data.themes.length} themes`,
        data.youtubeVideoIds.length > 0   && `${data.youtubeVideoIds.length} videos`,
        data.websites                     && `${data.websites.length} websites`,
        data.gameEngine                   && data.gameEngine,
        data.dlcIgdbIds.length > 0        && `${data.dlcIgdbIds.length} DLCs`,
        data.similarGameIgdbIds.length > 0 && `${data.similarGameIgdbIds.length} similares`,
      ].filter(Boolean).join(', ')

      console.log(`✅ ${game.title}${extras ? ` — ${extras}` : ''}`)
      updated++

      // Respetar rate limit de IGDB
      await sleep(260)
    } catch (error) {
      console.error(`❌ ${game.title} — ${error}`)
      errors++
      await sleep(1000)
    }
  }

  console.log(`\n── Resultado ──`)
  console.log(`Actualizados: ${updated}`)
  console.log(`Sin datos:    ${skipped}`)
  console.log(`Errores:      ${errors}`)

  await prisma.$disconnect()
}

main().catch(console.error)