// scripts/update-popularity-scores.ts
// Ejecutar con: npm run update:popularity
// Recalcula popularityScore para todos los juegos APPROVED, usando la misma
// fórmula que ya estaba en games/page.tsx (ahora en src/lib/popularity.ts).

import { prisma } from '../src/lib/prisma'
import { popularityScore } from '../src/lib/popularity'

async function main() {
  console.log('Recalculando popularityScore...')

  const games = await prisma.game.findMany({
    where: { status: 'APPROVED' },
    select: {
      id: true,
      igdbRating: true,
      igdbRatingCount: true,
      releaseDate: true,
    },
  })

  console.log(`${games.length} juegos a procesar`)

  let updated = 0
  for (const game of games) {
    const score = popularityScore(game)
    await prisma.game.update({
      where: { id: game.id },
      data: { popularityScore: score },
    })
    updated++
  }

  console.log(`✅ ${updated} juegos actualizados`)
}

main()
  .catch(err => {
    console.error('❌ Error recalculando popularityScore:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })