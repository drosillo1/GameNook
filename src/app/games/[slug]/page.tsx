// src/app/games/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReviewForm from '@/components/ReviewForm'
import ReviewCard from '@/components/ReviewCard'
import { Calendar, Tag, Monitor, ChevronLeft } from 'lucide-react'

// ── Tipos ──────────────────────────────────────────────────────
interface GameDetailPageProps {
  params: Promise<{ slug: string }>
}

// ── Rating helpers ─────────────────────────────────────────────
function getRatingMeta(rating: number) {
  if (rating >= 9)  return { icon: '👑', label: 'Obra Maestra',   color: 'text-yellow-400', barColor: '#fbbf24', chipclassName: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' }
  if (rating >= 7)  return { icon: '🏆', label: 'Imprescindible', color: 'text-orange-400', barColor: '#f97316', chipclassName: 'bg-orange-500/10 border-orange-500/30 text-orange-400' }
  if (rating >= 5)  return { icon: '⚡', label: 'Recomendado',    color: 'text-purple-400', barColor: '#a855f7', chipclassName: 'bg-purple-500/10 border-purple-500/30 text-purple-400' }
  if (rating >= 3)  return { icon: '❤️', label: 'Entretenido',    color: 'text-blue-400',   barColor: '#3b82f6', chipclassName: 'bg-blue-500/10 border-blue-500/30 text-blue-400' }
  return               { icon: '🎮', label: 'Jugable',           color: 'text-gray-400',   barColor: '#6b7280', chipclassName: 'bg-gray-500/10 border-gray-500/30 text-gray-400' }
}

// ── Data ───────────────────────────────────────────────────────
async function getGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

function calcStats(reviews: any[]) {
  const total = reviews.length
  if (!total) return { average: 0, total: 0, distribution: Array(10).fill(0) }
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  const distribution = Array(10).fill(0)
  reviews.forEach(r => { distribution[r.rating - 1]++ })
  return { average: sum / total, total, distribution }
}

// ── Page ───────────────────────────────────────────────────────
export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug }  = await params          // Next.js 15: params es async
  const session   = await getServerSession(authOptions)
  const game      = await getGame(slug)
  if (!game) notFound()

  const stats      = calcStats(game.reviews)
  const userReview = session ? game.reviews.find(r => r.userId === session.user?.id) : null
  const meta       = getRatingMeta(Math.round(stats.average) || 5)

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-gn-muted hover:text-gn-text
                     text-xs uppercase tracking-widest font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a juegos
        </Link>

        {/* ── HERO ── */}
        <div className="grid md:grid-cols-[280px_1fr] bg-gn-card border border-white/[0.06]
                        rounded-2xl overflow-hidden mb-8">

          {/* Imagen */}
          <div className="bg-gn-surface flex items-center justify-center min-h-[260px]">
            {game.imageUrl ? (
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gn-muted">
                <span className="text-5xl">🎮</span>
                <span className="text-xs uppercase tracking-widest">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col gap-4">
            <div>
              <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
                // Detalle del juego
              </p>
              <h1
                className="font-display font-black text-3xl md:text-4xl text-gn-text leading-tight"
                style={{ textShadow: '0 0 30px rgba(230,57,70,0.2)' }}
              >
                {game.title}
              </h1>
            </div>

            {/* Metadatos */}
            <div className="flex flex-wrap gap-3 text-sm text-gn-muted">
              {game.releaseDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(game.releaseDate).toLocaleDateString('es-ES')}
                </span>
              )}
              {game.platform.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  {game.platform.join(' · ')}
                </span>
              )}
            </div>

            {/* Géneros */}
            {game.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {game.genre.map((g: string) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 bg-gn-primary/8 border border-gn-primary/20
                               text-red-300 text-xs font-semibold uppercase tracking-wide rounded"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {game.description && (
              <p className="text-gn-muted text-sm leading-relaxed">{game.description}</p>
            )}

            {/* Score block */}
            <div className="mt-auto bg-gn-primary/5 border border-gn-primary/15 rounded-xl p-4
                            flex items-center gap-6 flex-wrap">
              {/* Número + label */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-display font-black text-5xl text-gn-primary"
                    style={{ textShadow: '0 0 20px rgba(230,57,70,0.4)' }}
                  >
                    {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                  </span>
                  {stats.average > 0 && (
                    <span className="text-gn-muted text-lg">/10</span>
                  )}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider mt-0.5 ${meta.color}`}>
                  {meta.icon} {stats.average > 0 ? meta.label : 'Sin reseñas'}
                </div>
                <div className="text-gn-muted text-xs mt-0.5">
                  {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                </div>
              </div>

              {/* Barra */}
              {stats.average > 0 && (
                <div className="flex-1 min-w-[120px]">
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(stats.average / 10) * 100}%`,
                        background: `linear-gradient(90deg, ${meta.barColor}99, ${meta.barColor})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Distribución */}
              {stats.total > 0 && (
                <div className="hidden lg:block space-y-0.5">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => {
                    const m   = getRatingMeta(r)
                    const pct = stats.total > 0 ? (stats.distribution[r - 1] / stats.total) * 100 : 0
                    return (
                      <div key={r} className="flex items-center gap-2">
                        <span className="font-display text-[10px] font-bold text-gn-muted w-5 text-right">
                          {r}
                        </span>
                        <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: m.barColor }}
                          />
                        </div>
                        <span className="text-[10px] text-gn-muted w-3">
                          {stats.distribution[r - 1]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6">

          {/* Formulario */}
          <div>
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 sticky top-20">
              <h2 className="font-display font-bold text-sm tracking-wide text-gn-text mb-5">
                {userReview ? 'Tu reseña' : 'Escribe una reseña'}
              </h2>

              {session ? (
                <ReviewForm gameId={game.id} existingReview={userReview} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎮</div>
                  <p className="text-gn-muted text-sm mb-5 leading-relaxed">
                    Inicia sesión para compartir tu opinión
                  </p>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                               text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5
                               rounded-lg shadow-gn-red transition-all duration-200"
                  >
                    ▶ Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reseñas */}
          <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-display font-bold text-sm tracking-wide text-gn-text">
                Reseñas de la comunidad
              </h2>
              <span className="text-gn-muted text-xs">{stats.total} reseñas</span>
            </div>

            {game.reviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🎮</div>
                <p className="text-gn-text font-semibold mb-1">Aún no hay reseñas</p>
                <p className="text-gn-muted text-sm">¡Sé el primero en compartir tu opinión!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {game.reviews.map((review: any) => (
                  <div key={review.id} className="px-6 py-5">
                    <ReviewCard
                      review={review}
                      currentUserId={session?.user?.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({ params }: GameDetailPageProps) {
  const { slug } = await params
  const game = await getGame(slug)
  if (!game) return { title: 'Juego no encontrado — GameNook' }
  return {
    title: `${game.title} — GameNook`,
    description: game.description ?? `Reseñas de ${game.title} en GameNook`,
  }
}hr