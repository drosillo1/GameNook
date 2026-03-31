// scripts/translate-descriptions.ts
import { PrismaClient } from '@prisma/client'
import { translateToSpanish } from '../src/lib/translate'

const prisma = new PrismaClient()

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Detección simple de español — si tiene estos caracteres probablemente ya está traducido
function looksLikeSpanish(text: string): boolean {
  return /[áéíóúüñ¿¡]/i.test(text)
}

async function main() {
  console.log('🌐 Traduciendo descripciones al español...\n')

  const games = await prisma.game.findMany({
    where:  { description: { not: null } },
    select: { id: true, title: true, description: true },
  })

  const pending = games.filter(g => g.description && !looksLikeSpanish(g.description))
  const already = games.length - pending.length

  console.log(`→ ${games.length} juegos con descripción`)
  console.log(`→ ${already} ya parecen estar en español — omitidos`)
  console.log(`→ ${pending.length} pendientes de traducir\n`)

  if (pending.length === 0) {
    console.log('✅ Todo traducido, nada que hacer.')
    return
  }

  let translated = 0
  let failed     = 0
  let skipped    = 0

  for (const game of pending) {
    if (!game.description) continue

    try {
      const result = await translateToSpanish(game.description)

      // Si MyMemory devuelve el mismo texto es que falló silenciosamente
      if (result === game.description) {
        console.log(`⚠  Sin cambios (posible límite): ${game.title}`)
        skipped++
        continue
      }

      await prisma.game.update({
        where: { id: game.id },
        data:  { description: result },
      })

      console.log(`✅ ${game.title}`)
      translated++

      // Pausa entre llamadas — MyMemory tiene rate limit
      await sleep(300)

    } catch (error) {
      console.error(`❌ Error en ${game.title}:`, error)
      failed++
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`✅ Traducidos:  ${translated}`)
  console.log(`⚠  Sin cambios: ${skipped}`)
  console.log(`❌ Fallidos:    ${failed}`)
  console.log(`\nVuelve a ejecutar mañana para los ${skipped + failed} restantes.`)
  console.log('─────────────────────────────────\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())