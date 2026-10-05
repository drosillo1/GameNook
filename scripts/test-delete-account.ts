// scripts/test-delete-account.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TAG = `test-delete-${Date.now()}`
const email = (n: string) => `${TAG}-${n}@gamenook.invalid`

let ok = true
const check = (label: string, passed: boolean, detail = '') => {
  console.log(`  ${passed ? 'OK  ' : 'FALLO'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!passed) ok = false
}

async function main() {
  console.log(`\nTag de esta ejecución: ${TAG}\n`)

  // Dos juegos aprobados cualesquiera para las pruebas
  const games = await prisma.game.findMany({
    where:  { status: 'APPROVED' },
    select: { id: true, title: true },
    take:   2,
  })
  if (games.length < 2) throw new Error('Hacen falta al menos 2 juegos APPROVED')
  const [gameShared, gameOther] = games
  console.log(`Juego compartido: ${gameShared.title}`)
  console.log(`Juego aparte:     ${gameOther.title}\n`)

  // ── Preparación ──
  const [userA, userB, userC] = await Promise.all([
    prisma.user.create({ data: { email: email('a'), name: 'Test A' } }),
    prisma.user.create({ data: { email: email('b'), name: 'Test B' } }),
    prisma.user.create({ data: { email: email('c'), name: 'Test C' } }),
  ])

  const reviewA = await prisma.review.create({
    data: { rating: 8, content: `${TAG} reseña de A`, userId: userA.id, gameId: gameShared.id },
  })
  const reviewC = await prisma.review.create({
    data: { rating: 6, content: `${TAG} reseña de C`, userId: userC.id, gameId: gameShared.id },
  })
  const reviewB = await prisma.review.create({
    data: { rating: 9, content: `${TAG} reseña de B`, userId: userB.id, gameId: gameOther.id },
  })

  // A da like a la reseña de B, igual que hace la aplicación: fila + contador.
  await prisma.$transaction([
    prisma.reviewLike.create({ data: { userId: userA.id, reviewId: reviewB.id } }),
    prisma.review.update({ where: { id: reviewB.id }, data: { likeCount: { increment: 1 } } }),
  ])

  const before = await prisma.review.findUniqueOrThrow({
    where: { id: reviewB.id }, select: { likeCount: true },
  })
  console.log(`likeCount de la reseña de B antes de borrar: ${before.likeCount}\n`)

  // ── Borrado de A, con la MISMA lógica que deleteAccount.ts ──
  console.log('Borrando la cuenta A...')
  await prisma.$transaction(async (tx) => {
    const likes = await tx.reviewLike.findMany({
      where: { userId: userA.id }, select: { reviewId: true },
    })
    if (likes.length > 0) {
      await tx.review.updateMany({
        where: { id: { in: likes.map(l => l.reviewId) } },
        data:  { likeCount: { decrement: 1 } },
      })
    }
    await tx.user.delete({ where: { id: userA.id } })
  })

  // ── Borrado de C, que reseñó el mismo juego que A ──
  console.log('Borrando la cuenta C (mismo juego que A)...\n')
  await prisma.$transaction(async (tx) => {
    const likes = await tx.reviewLike.findMany({
      where: { userId: userC.id }, select: { reviewId: true },
    })
    if (likes.length > 0) {
      await tx.review.updateMany({
        where: { id: { in: likes.map(l => l.reviewId) } },
        data:  { likeCount: { decrement: 1 } },
      })
    }
    await tx.user.delete({ where: { id: userC.id } })
  })

  // ── Comprobaciones ──
  console.log('Resultados:')

  const orphanA = await prisma.review.findUnique({ where: { id: reviewA.id } })
  check('la reseña de A sobrevive', orphanA !== null)
  check('la reseña de A quedó sin autor', orphanA?.userId === null, `userId = ${orphanA?.userId}`)

  const orphanC = await prisma.review.findUnique({ where: { id: reviewC.id } })
  check('la reseña de C sobrevive (mismo juego, 2º NULL)', orphanC !== null)
  check('la reseña de C quedó sin autor', orphanC?.userId === null, `userId = ${orphanC?.userId}`)

  const after = await prisma.review.findUniqueOrThrow({
    where: { id: reviewB.id }, select: { likeCount: true },
  })
  check('likeCount de la reseña de B volvió a 0', after.likeCount === 0, `likeCount = ${after.likeCount}`)

  const likesLeft = await prisma.reviewLike.count({ where: { reviewId: reviewB.id } })
  check('no quedan filas de like huérfanas', likesLeft === 0, `filas = ${likesLeft}`)

  // ── Limpieza ──
  console.log('\nLimpiando...')
  await prisma.review.deleteMany({ where: { id: { in: [reviewA.id, reviewC.id], } } })
  await prisma.review.deleteMany({ where: { userId: userB.id } })
  await prisma.user.delete({ where: { id: userB.id } })

  const leftovers = await prisma.user.count({ where: { email: { startsWith: TAG } } })
  check('no quedan usuarios de prueba', leftovers === 0, `usuarios = ${leftovers}`)

  console.log(ok ? '\nTodo correcto.\n' : '\nHAY FALLOS — revisar antes de pushear.\n')
  process.exitCode = ok ? 0 : 1
}

main()
  .catch(async (e) => {
    console.error('\nError durante la prueba:', e)
    // Limpieza de emergencia: no dejar datos sintéticos si algo revienta.
    console.error('Intentando limpiar los datos de prueba...')
    try {
      const users = await prisma.user.findMany({
        where: { email: { startsWith: TAG } }, select: { id: true },
      })
      const ids = users.map(u => u.id)
      await prisma.review.deleteMany({ where: { userId: { in: ids } } })
      await prisma.user.deleteMany({ where: { id: { in: ids } } })
      await prisma.review.deleteMany({ where: { content: { startsWith: TAG } } })
      console.error('Limpieza completada.')
    } catch (cleanupError) {
      console.error(`LIMPIEZA FALLIDA. Borra a mano lo que empiece por "${TAG}".`, cleanupError)
    }
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())