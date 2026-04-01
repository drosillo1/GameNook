// scripts/update-igdb-ratings.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TWITCH_CLIENT_ID     = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

async function getTwitchToken(): Promise<string> {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type:    'client_credentials',
    }),
  })
  const data = await res.json()
  return data.access_token
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('📊 Actualizando ratings de IGDB...\n')

  const token = await getTwitchToken()

  // Coger juegos que tienen igdbId pero no igdbRating
  const games = await prisma.game.findMany({
    where: {
      igdbId:      { not: null },
      igdbRating:  null,
    },
    select: { id: true, title: true, igdbId: true },
  })

  console.log(`→ ${games.length} juegos sin rating de IGDB\n`)

  // Procesar en lotes de 10 para no saturar IGDB
  const BATCH = 10
  let updated = 0
  let failed  = 0

  for (let i = 0; i < games.length; i += BATCH) {
    const batch   = games.slice(i, i + BATCH)
    const ids     = batch.map(g => g.igdbId).join(',')

    try {
      const res = await fetch('https://api.igdb.com/v4/games', {
        method:  'POST',
        headers: {
          'Client-ID':     TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'text/plain',
        },
        body: `
          fields rating, rating_count;
          where id = (${ids});
          limit ${BATCH};
        `,
      })

      const data = await res.json() as { id: number; rating?: number; rating_count?: number }[]

      for (const igdbGame of data) {
        const local = batch.find(g => g.igdbId === igdbGame.id)
        if (!local) continue

        await prisma.game.update({
          where: { id: local.id },
          data: {
            igdbRating:      igdbGame.rating       ?? null,
            igdbRatingCount: igdbGame.rating_count ?? null,
          },
        })

        console.log(`✅ ${local.title} — rating: ${igdbGame.rating?.toFixed(1) ?? '—'}, votos: ${igdbGame.rating_count ?? 0}`)
        updated++
      }

      await sleep(300)
    } catch (err) {
      console.error(`❌ Error en lote:`, err)
      failed += batch.length
    }
  }

  console.log(`\n──────────────────────────`)
  console.log(`✅ Actualizados: ${updated}`)
  console.log(`❌ Fallidos:     ${failed}`)
  console.log(`──────────────────────────\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())