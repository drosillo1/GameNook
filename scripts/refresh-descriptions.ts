// scripts/refresh-descriptions.ts
// Restaura la descripción de juegos concretos desde IGDB (traducida al español).
// Útil para descripciones rotas o de prueba. Solo escribe con --apply.
//
//   $env:NODE_OPTIONS="--conditions=react-server"; npx tsx --env-file=.env scripts/refresh-descriptions.ts brawl-stars otro-slug; Remove-Item Env:NODE_OPTIONS
//   (añadir --apply para guardar)
import { PrismaClient } from '@prisma/client'
import { getIGDBGameDetails } from '../src/lib/igdb'
import { translateToSpanish } from '../src/lib/translate'

const prisma = new PrismaClient()

const DESCRIPTION_MAX_LENGTH = 5000   // mismo tope que POST /api/games

async function main() {
  const args  = process.argv.slice(2)
  const apply = args.includes('--apply')
  const slugs = args.filter(a => !a.startsWith('--'))

  if (slugs.length === 0) {
    console.log('Uso: refresh-descriptions.ts <slug> [<slug>...] [--apply]')
    return
  }

  console.log(apply ? '✍  Modo escritura (--apply)\n' : '👀 Modo prueba — no se guarda nada (añade --apply)\n')

  for (const slug of slugs) {
    const game = await prisma.game.findUnique({
      where:  { slug },
      select: { id: true, title: true, igdbId: true, description: true },
    })

    if (!game) {
      console.log(`❌ ${slug}: no existe en la BD`)
      continue
    }
    if (!game.igdbId) {
      console.log(`❌ ${game.title}: no tiene igdbId, no se puede restaurar`)
      continue
    }

    const igdb    = await getIGDBGameDetails(game.igdbId)
    const summary = igdb?.summary?.trim()
    if (!summary) {
      console.log(`⚠  ${game.title}: IGDB no tiene summary — se quedaría sin descripción, lo salto`)
      continue
    }

    const translated = await translateToSpanish(summary)
    if (translated === summary) {
      console.log(`⚠  ${game.title}: la traducción falló (ver error [translate] arriba), lo salto`)
      continue
    }

    const finalDescription = translated.slice(0, DESCRIPTION_MAX_LENGTH)

    console.log(`── ${game.title}`)
    console.log(`   antes:  ${JSON.stringify(game.description?.slice(0, 80))}`)
    console.log(`   después: ${finalDescription.slice(0, 160)}${finalDescription.length > 160 ? '…' : ''}`)

    if (apply) {
      await prisma.game.update({
        where: { id: game.id },
        data:  { description: finalDescription },
      })
      console.log('   ✅ guardado')
    }
    console.log()
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())