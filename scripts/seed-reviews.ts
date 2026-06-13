// scripts/seed-reviews.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Usuarios ficticios ──────────────────────────────────────────
const SEED_USERS = [
  {
    name:  'Carlos Vega',
    email: 'carlos@seed.gamenook.es',
    image: null,
    // Perfil: puntuador generoso, le gustan acción y aventura
    favoriteGenres: ['Shooter', 'Aventura', 'Hack & Slash'],
    ratingBias: 8,   // tira hacia notas altas
  },
  {
    name:  'Laura Méndez',
    email: 'laura@seed.gamenook.es',
    image: null,
    // Perfil: crítica, especialista en RPGs e indies
    favoriteGenres: ['RPG', 'Aventura', 'Plataformas', 'Puzle'],
    ratingBias: 6,   // más exigente
  },
  {
    name:  'Marcos Gil',
    email: 'marcos@seed.gamenook.es',
    image: null,
    // Perfil: fan de FromSoftware y juegos difíciles
    favoriteGenres: ['RPG', 'Hack & Slash', 'Shooter'],
    ratingBias: 7,
  },
  {
    name:  'Sofía Ramos',
    email: 'sofia@seed.gamenook.es',
    image: null,
    // Perfil: casual, le gustan juegos bonitos y narrativos
    favoriteGenres: ['Aventura', 'Plataformas', 'Simulación', 'Puzle'],
    ratingBias: 8,
  },
  {
    name:  'Adrián Torres',
    email: 'adrian@seed.gamenook.es',
    image: null,
    // Perfil: completista, juega de todo
    favoriteGenres: [],  // sin preferencia, juega todo
    ratingBias: 7,
  },
]

// ── Reseñas con texto (solo ~35% de las reseñas tendrán texto) ──
const REVIEW_TEXTS: Record<string, string[]> = {
  'red-dead-redemption-2': [
    'Una obra maestra absoluta. La historia de Arthur Morgan es de las más emotivas que he vivido en un videojuego.',
    'El mundo abierto más vivo que he visto. Puedes pasarte horas simplemente explorando sin hacer misiones.',
    'Lento al principio pero cuando engancha no puedes parar. La banda sonora es increíble.',
  ],
  'elden-ring': [
    'El mejor souls de FromSoftware con diferencia. La libertad de exploración es brutal.',
    'Difícil pero justo. Cada muerte te enseña algo. Malenia es lo más injusto que he jugado en mi vida.',
    'El mundo abierto cambia por completo la fórmula souls. Mágico.',
  ],
  'the-witcher-3-wild-hunt': [
    'Los DLCs son mejores que muchos juegos completos. Hearts of Stone especialmente.',
    'Geralt es uno de los mejores protagonistas de la historia de los videojuegos.',
    'Las decisiones morales son de verdad difíciles. No hay buenos ni malos claros.',
  ],
  'god-of-war': [
    'El plano secuencia completo es una pasada técnica. La relación Kratos-Atreus es el corazón del juego.',
    'Rejugado dos veces. Cada vez descubro algo nuevo en los diálogos.',
  ],
  'baldur-s-gate-iii': [
    'El RPG más completo que existe ahora mismo. Larian ha superado todas las expectativas.',
    'Más de 200 horas y sigo encontrando rutas que no había explorado.',
    'La escritura de los personajes companions es de nivel cinematográfico.',
  ],
  'hades': [
    'El mejor roguelike que existe. La narrativa entre runs es genial.',
    'Imposible cansarse. Cada run se siente distinta.',
  ],
  'hollow-knight': [
    'El metroidvania más atmosférico que he jugado. Hallownest tiene una lore increíble.',
    'Difícil pero adictivo. El jefe final me costó tres días.',
  ],
  'celeste': [
    'Plataformas preciso y una historia sorprendentemente emotiva sobre la ansiedad.',
    'El capítulo 7 es lo más difícil que he jugado en un plataformas. Merece la pena.',
  ],
  'disco-elysium': [
    'No es un videojuego normal, es una novela interactiva brillante. Único.',
    'El protagonista más roto y humano que he visto. La escritura es excepcional.',
  ],
  'sekiro-shadows-die-twice': [
    'El sistema de combate más satisfactorio de FromSoftware. Cuando dominas el parry es poesía.',
    'Más difícil que Dark Souls al principio pero más justo. El click mental que da cuando entiendes el ritmo es brutal.',
  ],
  'clair-obscur-expedition-33': [
    'Una sorpresa enorme. El sistema de combate es fresco y la dirección artística impresionante.',
    'El juego del año sin duda. No esperaba algo así de un estudio nuevo.',
  ],
  'cyberpunk-2077': [
    'Lanzamiento desastroso pero el juego que es ahora con Phantom Liberty es sobresaliente.',
    'Night City es el mejor mapa de mundo abierto que he visto. Cada callejón tiene historia.',
  ],
  'portal-2': [
    'Los puzles más creativos de la historia. El co-op con un amigo es experiencia obligatoria.',
  ],
  'stardew-valley': [
    'El juego más relajante que existe. Perfecto para desconectar.',
    'Llevo 300 horas y sigo volviendo cada temporada.',
  ],
  'outer-wilds': [
    'El juego más especial que he jugado en años. No digas nada a quien no lo haya jugado.',
    'La exploración y el descubrimiento son la mecánica. Único en su especie.',
  ],
  'mass-effect-2': [
    'La misión suicida final es el clímax más épico de una trilogía de juegos.',
    'Los personajes companions son los mejores de cualquier RPG occidental.',
  ],
  'bloodborne': [
    'La ambientación lovecraftiana es insuperable. Yharnam es una ciudad con alma.',
    'El más estético de los souls. La bestia que más miedo me ha dado en un videojuego.',
  ],
  'inside': [
    'Dos horas de pura atmósfera. El final te deja sin palabras.',
  ],
  'horizon-zero-dawn': [
    'El lore es lo mejor del juego. La historia del mundo pre-apocalíptico es brillante.',
  ],
  'the-last-of-us': [
    'La narrativa más cinematográfica de los videojuegos en su momento. Joel y Ellie son icónicos.',
    'Rejugado con la remasterizada. Sigue siendo brutal emocionalmente.',
  ],
  'the-last-of-us-part-ii': [
    'Técnicamente impresionante y narrativamente valiente. Divisivo pero necesario.',
    'La sección de Abby es incómoda a propósito y funciona. Requiere paciencia.',
  ],
  'alan-wake-ii': [
    'Remedy en su mejor momento. La estructura del juego es experimental y funciona.',
    'El musical de mitad del juego es una de las secuencias más memorables que he visto.',
  ],
  'forza-horizon-6': [
    'La saga de conducción más accesible y divertida del mercado. Brutal.',
  ],
  '007-first-light': [
    'Bond vuelve con fuerza. El sigilo está muy bien implementado.',
  ],
  'stray': [
    'Corto pero precioso. Jugar como gato en un mundo cyberpunk es tan bueno como suena.',
  ],
  'dark-souls-iii': [
    'El más accesible de los souls originales. El DLC Ringed City es de lo mejor de la saga.',
  ],
  'nier-automata': [
    'Los múltiples finales son necesarios para entender la historia completa. Jugarlo hasta el final E.',
    '2B es icónica pero la historia de 9S es la más emotiva del juego.',
  ],
  'super-mario-odyssey': [
    'La alegría pura en forma de videojuego. Cada mundo es una sorpresa.',
  ],
  'batman-arkham-city': [
    'El mejor juego de superhéroes que se ha hecho. El combate sigue siendo satisfactorio.',
  ],
  'grand-theft-auto-v': [
    'La historia de los tres protagonistas es lo mejor del juego. Trevor es un personaje único.',
  ],
  'it-takes-two': [
    'El mejor co-op cooperativo de los últimos años. Variedad de mecánicas impresionante.',
  ],
  'half-life-2': [
    'Sigue siendo una clase magistral de diseño de niveles y narrativa ambiental.',
  ],
}

// ── Helpers ─────────────────────────────────────────────────────
function weightedRating(base: number, gameGenres: string[], userGenres: string[]): number {
  const match = gameGenres.some(g => userGenres.includes(g))
  const variance = Math.floor(Math.random() * 3) - 1  // -1, 0, +1
  const boost    = match ? 1 : -1
  return Math.min(10, Math.max(1, base + boost + variance))
}

function maybeText(slug: string, userName: string): string | null {
  // ~35% de probabilidad de tener texto
  if (Math.random() > 0.35) return null
  const options = REVIEW_TEXTS[slug]
  if (!options || options.length === 0) return null
  return options[Math.floor(Math.random() * options.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Iniciando seed de usuarios y reseñas...\n')

  // 1. Crear usuarios seed (upsert por email)
  const createdUsers = []
  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: { name: u.name },
      create: { name: u.name, email: u.email, image: u.image },
    })
    createdUsers.push({ ...user, favoriteGenres: u.favoriteGenres, ratingBias: u.ratingBias })
    console.log(`✓ Usuario: ${u.name} (${user.id})`)
  }

  // 2. Cargar juegos aprobados
  const games = await prisma.game.findMany({
    where:   { status: 'APPROVED' },
    select:  { id: true, slug: true, title: true, genre: true },
    orderBy: { igdbRating: 'desc' },
  })
  console.log(`\n📚 ${games.length} juegos aprobados encontrados\n`)

  // 3. Crear reseñas
  let created = 0
  let skipped = 0

  for (const user of createdUsers) {
    // Cada usuario reseña entre 25 y 45 juegos aleatorios
    const count     = 25 + Math.floor(Math.random() * 20)
    const selection = shuffle(games).slice(0, count)

    for (const game of selection) {
      const rating  = weightedRating(user.ratingBias, game.genre, user.favoriteGenres)
      const content = maybeText(game.slug, user.name)

      try {
        await prisma.review.create({
          data: {
            userId:  user.id,
            gameId:  game.id,
            rating,
            content,
          },
        })
        created++
      } catch {
        // @@unique([userId, gameId]) — ya existe, se salta
        skipped++
      }
    }

    console.log(`✓ ${user.name}: ${selection.length} reseñas creadas`)
  }

  // 4. Crear entradas de colección
  const STATUSES = ['PLAYING', 'COMPLETED', 'WANT_TO_PLAY', 'DROPPED'] as const
  const statusWeights = [0.15, 0.50, 0.25, 0.10]  // mayoría completados

  function randomStatus() {
    const r = Math.random()
    let acc = 0
    for (let i = 0; i < STATUSES.length; i++) {
      acc += statusWeights[i]
      if (r < acc) return STATUSES[i]
    }
    return 'COMPLETED'
  }

  console.log('\n🎮 Creando colecciones...')

  for (const user of createdUsers) {
    // Cada usuario tiene entre 15 y 30 juegos en colección
    const count     = 15 + Math.floor(Math.random() * 15)
    const selection = shuffle(games).slice(0, count)

    for (const game of selection) {
      try {
        await prisma.gameCollection.create({
          data: {
            userId: user.id,
            gameId: game.id,
            status: randomStatus(),
          },
        })
      } catch {
        // ya existe
      }
    }

    console.log(`✓ ${user.name}: ${selection.length} juegos en colección`)
  }

  console.log(`\n✅ Seed completado`)
  console.log(`   Reseñas creadas: ${created}`)
  console.log(`   Saltadas (duplicado): ${skipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())