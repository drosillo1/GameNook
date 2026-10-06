// scripts/translate-descriptions.ts
import { PrismaClient } from '@prisma/client'
import { translateToSpanish } from '../src/lib/translate'

// Ejecutar con la condición react-server (por el `import 'server-only'` de
// translate.ts) y cargando el .env (MYMEMORY_EMAIL):
//   $env:NODE_OPTIONS="--conditions=react-server"; npx tsx --env-file=.env scripts/translate-descriptions.ts; Remove-Item Env:NODE_OPTIONS

const prisma = new PrismaClient()

// Tras N fallos seguidos paramos, en vez de seguir llamando a MyMemory con
// todo lo pendiente: o se ha agotado la cuota o lo que queda no es traducible.
const MAX_CONSECUTIVE_FAILURES = 3

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const EN_WORDS = new Set([
  'the', 'and', 'of', 'to', 'in', 'is', 'you', 'your', 'with', 'for', 'an', 'as',
  'on', 'their', 'from', 'game', 'this', 'are', 'it', 'its',
])
const ES_WORDS = new Set([
  'el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'un', 'una', 'que', 'por',
  'con', 'para', 'su', 'sus', 'es', 'juego', 'sobre', 'se', 'al', 'lo',
])

// Cuenta palabras frecuentes de cada idioma. Basta con una para decidir: las
// descripciones cortas ("Helltaker es un juego corto…") daban falsos positivos
// con un umbral mayor. Las tildes solo deciden si no hay ninguna o hay empate.
function looksLikeSpanish(text: string): boolean {
  const words = text.toLowerCase().match(/[a-záéíóúüñ]+/g) ?? []
  let en = 0
  let es = 0
  for (const w of words) {
    if (EN_WORDS.has(w)) en++
    if (ES_WORDS.has(w)) es++
  }
  if (en !== es) return es > en
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

  let translated          = 0
  let failed              = 0
  let skipped             = 0
  let consecutiveFailures = 0
  let stoppedEarly        = false

  for (const game of pending) {
    if (!game.description) continue

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.log(
        `\n⛔ ${MAX_CONSECUTIVE_FAILURES} fallos seguidos. Si arriba hay errores [translate], ` +
        `es la cuota diaria; si no, esas descripciones no son traducibles (ya en español o basura). Paro aquí.`
      )
      stoppedEarly = true
      break
    }

    try {
      const result = await translateToSpanish(game.description)

      // translateToSpanish devuelve el original ante cualquier fallo (HTTP,
      // status, aviso de cuota dentro del texto) y MyMemory también lo devuelve
      // igual si ya estaba en español: mismo texto = no traducido.
      if (result === game.description) {
        console.log(`⚠  Sin cambios: ${game.title}`)
        skipped++
        consecutiveFailures++
        continue
      }

      await prisma.game.update({
        where: { id: game.id },
        data:  { description: result },
      })

      console.log(`✅ ${game.title}`)
      translated++
      consecutiveFailures = 0

      // Pausa entre llamadas — MyMemory tiene rate limit
      await sleep(300)

    } catch (error) {
      console.error(`❌ Error en ${game.title}:`, error)
      failed++
      consecutiveFailures++
    }
  }

  const remaining = pending.length - translated

  console.log('\n─────────────────────────────────')
  console.log(`✅ Traducidos:  ${translated}`)
  console.log(`⚠  Sin cambios: ${skipped}`)
  console.log(`❌ Fallidos:    ${failed}`)
  if (remaining > 0) {
    console.log(`\n${stoppedEarly ? 'Detenido. ' : ''}Quedan ${remaining} pendientes — revisa los "Sin cambios" antes de relanzar.`)
  }
  console.log('─────────────────────────────────\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())