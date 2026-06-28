// scripts/backfill-seed-usernames.ts
import { prisma } from '@/lib/prisma'
import { slugifyUsername } from '@/lib/username'

async function main() {
  const seedUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@seed.gamenook.es' }, username: null },
    select: { id: true, name: true, email: true },
  })

  console.log(`Encontrados ${seedUsers.length} usuarios de seed sin username.`)

  for (const user of seedUsers) {
    const base = slugifyUsername(user.name ?? user.email.split('@')[0])
    let username = base
    let suffix = 1

    // Por si el slug base ya existe (no debería con estos 5, pero por seguridad)
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}_${suffix}`
      suffix++
    }

    await prisma.user.update({ where: { id: user.id }, data: { username } })
    console.log(`✔ ${user.name} → ${username}`)
  }

  console.log('Backfill completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())