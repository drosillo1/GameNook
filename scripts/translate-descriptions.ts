// scripts/translate-descriptions.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { translateToSpanish } from '../src/lib/translate'

const connectionString = process.env.DATABASE_URL!

// Setup
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🌐 Traduciendo descripciones al español...\n')

  const games = await prisma.game.findMany({
    where: {
      description: { not: null },
    },
    select: { id: true, title: true, description: true },
  })

  console.log(`→ ${games.length} juegos con descripción\n`)

  let translated = 0
  let failed     = 0

  for (const game of games) {
    if (!game.description) continue

    try {
      const descriptionES = await translateToSpanish(game.description)

      await prisma.game.update({
        where: { id: game.id },
        data:  { description: descriptionES },
      })

      console.log(`✅ ${game.title}`)
      translated++

      // Pausa para respetar rate limits de DeepL
      await sleep(200)

    } catch (error) {
      console.error(`❌ Error en ${game.title}:`, error)
      failed++
    }
  }

  console.log(`\n─────────────────────────────`)
  console.log(`✅ Traducidos: ${translated}`)
  console.log(`❌ Fallidos:   ${failed}`)
  console.log(`─────────────────────────────\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())