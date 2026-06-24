// src/app/games/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReviewForm from '@/components/ReviewForm'
import { Calendar, Monitor, ChevronLeft } from 'lucide-react'
import CollectionButton from '@/components/CollectionButton'
import { RatingIcon } from '@/components/RatingIcon'
import { getRatingData, getRatingBarColor } from '@/lib/rating'
import IGDBGameDetails from '@/components/IGDBGameDetails'
import ReviewList from '@/components/ReviewList'

interface GameDetailPageProps {
  params: Promise<{ slug: string }>
}

// ── Datos del juego cacheados por 24 horas ──
const getGameCached = (slug: string) => unstable_cache(
  async () => {
    return prisma.game.findUnique({
      where: { slug },
      select: {
        id: true, title: true, slug: true, description: true, 
        imageUrl: true, releaseDate: true, genre: true, 
        platform: true, igdbId: true,
      },
    })
  },
  ['game-detail', slug],
  { revalidate: 86400, tags: [`game-${slug}`] } 
)()

function calcStats(reviews: any[]) {
  const total = reviews.length
  if (!total) return { average: 0, total: 0, distribution: Array(10).fill(0) }
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  const distribution = Array(10).fill(0)
  reviews.forEach(r => { distribution[r.rating - 1]++ })
  return { average: sum / total, total, distribution }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params

  // 1. Cargamos todo en paralelo para máxima velocidad
  const [game, session, reviews] = await Promise.all([
    getGameCached(slug),
    getServerSession(authOptions),
    prisma.review.findMany({
      where: { game: { slug } },
      select: {
        id: true, rating: true, content: true, createdAt: true, updatedAt: true, userId: true,
        user: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
  ])

  if (!game) notFound()

  const stats = calcStats(reviews)
  const userReview = session ? reviews.find(r => r.userId === session.user?.id) : null
  const ratingData = getRatingData(Math.round(stats.average) || 5)

  const reviewsWithUsernames = reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    user: {
      ...r.user,
      username: r.user.name ?? r.user.email?.split('@')[0] ?? 'Usuario',
    },
  }))

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Back Link */}
        <Link href="/games" className="inline-flex items-center gap-1.5 text-gn-muted hover:text-gn-text text-xs uppercase tracking-widest font-semibold mb-8 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a juegos
        </Link>

        {/* HERO */}
        <div className="grid md:grid-cols-[240px_1fr] bg-gn-card border border-white/[0.06] rounded-2xl overflow-hidden mb-8">
          <div className="relative bg-gn-surface">
            <div className="aspect-[3/4] w-full relative">
              {game.imageUrl ? (
                <Image src={game.imageUrl} alt={game.title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 240px" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gn-muted">
                  <span className="text-5xl">🎮</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 flex flex-col gap-4 min-w-0">
            <div>
              <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">// Detalle del juego</p>
              <h1 className="font-display font-black text-3xl md:text-4xl text-gn-text leading-tight">{game.title}</h1>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gn-muted">
              {game.releaseDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(game.releaseDate).toLocaleDateString('es-ES')}
                </span>
              )}
              {game.platform.length > 0 && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{game.platform.slice(0, 4).join(' · ')}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {game.genre.map((g: string) => (
                <span key={g} className="px-2.5 py-1 bg-gn-primary/8 border border-gn-primary/20 text-red-300 text-xs font-semibold uppercase tracking-wide rounded">
                  {g}
                </span>
              ))}
            </div>

            <div>
              <CollectionButton gameId={game.id} />
            </div>

            {game.description && (
              <p className="text-gn-muted text-sm leading-relaxed line-clamp-4">{game.description}</p>
            )}

            {/* Stats Bar */}
            <div className="mt-auto bg-gn-primary/5 border border-gn-primary/15 rounded-xl p-4 flex items-center gap-6 flex-wrap">
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-5xl text-gn-primary" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                  </span>
                  {stats.average > 0 && <span className="text-gn-muted text-lg">/10</span>}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider mt-0.5 ${ratingData.tailwind}`}>
                  {stats.average > 0 ? ratingData.label : 'Sin reseñas'}
                </div>
              </div>
              
              {stats.average > 0 && (
                <div className="flex-1 min-w-[100px]">
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(stats.average / 10) * 100}%`, background: getRatingBarColor(Math.round(stats.average)) }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 sticky top-20 h-fit">
            <h2 className="font-display font-bold text-sm tracking-wide text-gn-text mb-5">{userReview ? 'Tu reseña' : 'Escribe una reseña'}</h2>
            {session ? (
              <ReviewForm key={userReview?.id ?? 'new'} gameId={game.id} existingReview={userReview} />
            ) : (
              <div className="text-center py-8">
                <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg">
                  ▶ Iniciar sesión
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
              <h2 className="font-display font-bold text-sm tracking-wide text-gn-text">Reseñas</h2>
              <span className="text-gn-muted text-xs">{stats.total} reseñas</span>
            </div>
            <ReviewList reviews={reviewsWithUsernames} currentUserId={session?.user?.id} />
          </div>
        </div>

        {game.igdbId && <IGDBGameDetails igdbId={game.igdbId} gameSlug={game.slug} />}
      </div>
    </div>
  )
}