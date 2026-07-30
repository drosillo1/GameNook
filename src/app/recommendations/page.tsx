// src/app/recommendations/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getRecommendations, RECOMMENDATIONS_COUNT } from '@/lib/recommendations'
import RecommendationsClient from '@/components/RecommendationsClient'

// Página personalizada por usuario — no debe indexarse
export const metadata = {
  title:  'Para ti — GameNook',
  robots: { index: false, follow: false },
}

function getCopy(level: 0 | 1 | 2, completedCount: number) {
  if (level === 0) {
    return {
      title:    'Descubre tu próximo juego',
      subtitle: 'Aún no has completado ningún juego, así que te mostramos lo más popular ' +
                'de GameNook. Marca algo como completado y esto se personaliza al instante.',
    }
  }

  if (level === 1) {
    return {
      title:    'Para ti',
      subtitle: `Basado en ${completedCount === 1 ? 'el juego' : 'los juegos'} que has ` +
                `completado. Completa alguno más y las recomendaciones se afinan.`,
    }
  }

  return {
    title:    'Para ti',
    subtitle: `Recomendaciones cruzadas a partir de tus ${completedCount} juegos completados.`,
  }
}

export default async function RecommendationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/signin?callbackUrl=/recommendations')

  const { level, completedCount, games, availableGenres } =
    await getRecommendations(session.user.id)

  const copy = getCopy(level, completedCount)

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Recomendaciones
          </p>
          <h1 className="font-display font-black text-4xl text-gn-text">
            {copy.title}
          </h1>
          <p className="text-gn-muted text-sm mt-2 max-w-2xl leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        {games.length === 0 ? (
          // Solo alcanzable si el catálogo está vacío
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="font-display font-bold text-xl text-gn-text mb-2">
              Todavía no hay nada que recomendarte
            </h3>
            <p className="text-gn-muted text-sm mb-6 max-w-xs mx-auto">
              Parece que ya tienes en tu colección todo lo que hay en el catálogo.
            </p>
            <Link
              href="/games/add"
              className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                         text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5
                         rounded-lg shadow-gn-red transition-all"
            >
              ▶ Agregar un juego
            </Link>
          </div>
        ) : (
          <>
            <RecommendationsClient
              games={games}
              availableGenres={availableGenres}
            />

            <div className="mt-10 pt-8 border-t border-white/[0.06] text-center">
              <p className="text-gn-muted text-sm mb-4">
                {games.length === RECOMMENDATIONS_COUNT
                  ? '¿Nada te convence? Explora el catálogo completo.'
                  : '¿Echas en falta algún juego? Agrégalo desde IGDB.'}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 border border-white/[0.08]
                             hover:border-gn-primary/30 text-gn-muted hover:text-gn-text
                             text-xs font-bold uppercase tracking-wider px-4 py-2.5
                             rounded-lg transition-all"
                >
                  Ver catálogo
                </Link>
                <Link
                  href="/games/add"
                  className="inline-flex items-center gap-2 border border-white/[0.08]
                             hover:border-gn-primary/30 text-gn-muted hover:text-gn-text
                             text-xs font-bold uppercase tracking-wider px-4 py-2.5
                             rounded-lg transition-all"
                >
                  Agregar juego
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}