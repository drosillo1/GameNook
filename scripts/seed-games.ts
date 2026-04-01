import { PrismaClient } from '@prisma/client'
import { translateToSpanish } from '../src/lib/translate'

const prisma = new PrismaClient()

// ── Config ─────────────────────────────────────────────────────
const TWITCH_CLIENT_ID     = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

const GENRES = [
  { name: 'RPG',         igdbId: 12  },
  { name: 'Acción',      igdbId: 4   },
  { name: 'Aventura',    igdbId: 31  },
  { name: 'Indie',       igdbId: 32  },
  { name: 'Shooter',     igdbId: 5   },
  { name: 'Estrategia',  igdbId: 15  },
  { name: 'Plataformas', igdbId: 8   },
  { name: 'Terror',      igdbId: 19  },
  { name: 'Deportes',    igdbId: 14  },
  { name: 'Simulación',  igdbId: 13  },
]

const GAMES_PER_GENRE = 20

// ── Auth Twitch ────────────────────────────────────────────────
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

// ── Fetch IGDB ─────────────────────────────────────────────────
async function fetchGamesByGenre(
  token: string,
  genreId: number,
  genreName: string
): Promise<any[]> {
  const res = await fetch('https://api.igdb.com/v4/games', {
    method:  'POST',
    headers: {
      'Client-ID':     TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'text/plain',
    },
    body: `
      fields name, slug, summary, cover.url,
             first_release_date, genres.name,
             platforms.name, rating, rating_count;
      where genres = (${genreId})
        & rating >= 75
        & rating_count >= 50
        & version_parent = null
        & cover != null;
      sort rating_count desc;
      limit ${GAMES_PER_GENRE};
    `,
  })

  if (!res.ok) {
    console.error(`Error fetching genre ${genreName}: ${res.status}`)
    return []
  }

  return res.json()
}

// ── Helpers ────────────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug    = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.game.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🎮 Iniciando seed de GameNook...\n')

  const token = await getTwitchToken()
  console.log('✅ Token Twitch obtenido\n')

  const seenIgdbIds = new Set<number>()
  let totalCreated  = 0
  let totalSkipped  = 0

  for (const genre of GENRES) {
    console.log(`\n📂 Procesando género: ${genre.name} (ID: ${genre.igdbId})`)

    const games = await fetchGamesByGenre(token, genre.igdbId, genre.name)
    console.log(`   → ${games.length} juegos obtenidos de IGDB`)

    for (const game of games) {
      if (seenIgdbIds.has(game.id)) {
        console.log(`   ⏭  Duplicado omitido: ${game.name}`)
        totalSkipped++
        continue
      }
      seenIgdbIds.add(game.id)

      const existing = await prisma.game.findFirst({
        where: {
          OR: [
            { igdbId: game.id },
            { title: { equals: game.name, mode: 'insensitive' } },
          ],
        },
      })

      if (existing) {
        console.log(`   ⏭  Ya existe en BD: ${game.name}`)
        totalSkipped++
        continue
      }

      const coverUrl = game.cover?.url
        ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
        : null

      const releaseDate = game.first_release_date
        ? new Date(game.first_release_date * 1000)
        : null

      const genres    = (game.genres    ?? []).map((g: any) => g.name) as string[]
      const platforms = (game.platforms ?? []).map((p: any) => p.name) as string[]

      const baseSlug = generateSlug(game.name)
      const slug     = await ensureUniqueSlug(baseSlug)

      const descriptionES = game.summary
        ? await translateToSpanish(game.summary)
        : null

      try {
        await prisma.game.create({
          data: {
            title:       game.name,
            slug,
            description: descriptionES,
            imageUrl:    coverUrl,
            releaseDate,
            genre:       genres,
            platform:    platforms,
            igdbId:      game.id,
            status:      'APPROVED',
            igdbRating:      game.rating      ?? null,
            igdbRatingCount: game.rating_count ?? null,
          },
        })
        console.log(`   ✅ Creado: ${game.name}`)
        totalCreated++
      } catch (err) {
        console.error(`   ❌ Error creando ${game.name}:`, err)
      }
    }

    console.log(`   ⏳ Pausa 1.5s antes del siguiente género...`)
    await sleep(1500)
  }

  console.log('\n─────────────────────────────────')
  console.log(`🎮 Seed completado`)
  console.log(`   ✅ Creados:  ${totalCreated}`)
  console.log(`   ⏭  Omitidos: ${totalSkipped}`)
  console.log('─────────────────────────────────\n')
}

main()
  .catch(e => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })