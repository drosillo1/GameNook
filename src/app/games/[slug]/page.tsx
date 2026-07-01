// src/app/games/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReviewForm from '@/components/ReviewForm'
import { Calendar, Monitor, ChevronLeft, Package } from 'lucide-react'
import CollectionButton from '@/components/CollectionButton'
import { getRatingData, getRatingBarColor } from '@/lib/rating'
import IGDBGameDetails from '@/components/IGDBGameDetails'
import ReviewList from '@/components/ReviewList'
import GameDescription from '@/components/GameDescription'
import { translateTheme } from '@/lib/themes'

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
        // Datos enriquecidos
        themes: true,
        playerPerspectives: true,
        multiplayerInfo: true,
        ageRatings: true,
        languageSupports: true,
        gameEngine: true,
        websites: true,
        youtubeVideoIds: true,
        dlcIgdbIds: true,
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

// Mínimo de reseñas con votos y de reseñas totales para mostrar la sección "Destacadas"
const FEATURED_MIN_LIKED_REVIEWS = 3
const FEATURED_MIN_TOTAL_REVIEWS = 4
const FEATURED_COUNT = 3

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params

  // 1. Cargamos todo en paralelo para máxima velocidad
  const [game, session, reviews] = await Promise.all([
    getGameCached(slug),
    getServerSession(authOptions),
    prisma.review.findMany({
      where: { game: { slug } },
      select: {
        id: true, rating: true, content: true, createdAt: true, updatedAt: true,
        userId: true, likeCount: true,
        user: { select: { id: true, name: true, username: true, email: true, image: true, avatar: true } },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  ])

  if (!game) notFound()

  // ── DLCs/expansiones: leemos IDs de BD → cruzamos con catálogo ──
  let dlcGames: { title: string; slug: string; imageUrl: string | null }[] = []
  if (game.dlcIgdbIds && game.dlcIgdbIds.length > 0) {
    dlcGames = await prisma.game.findMany({
      where: { igdbId: { in: game.dlcIgdbIds }, status: 'APPROVED' },
      select: { title: true, slug: true, imageUrl: true },
      orderBy: { releaseDate: 'desc' },
    })
  }

  const stats = calcStats(reviews)
  const userReview = session ? reviews.find(r => r.userId === session.user?.id) : null
  const ratingData = getRatingData(Math.round(stats.average) || 5)
  const currentUserId = session?.user?.id

  const reviewsWithUsernames = reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    userId: r.userId,
    likeCount: r.likeCount,
    likedByCurrentUser: currentUserId ? r.likes.some(l => l.userId === currentUserId) : false,
    user: {
      id:          r.user.id,
      name:        r.user.name,
      username:    r.user.username,
      displayName: r.user.name ?? r.user.email?.split('@')[0] ?? 'Usuario',
      image:       r.user.image,
      avatar:      r.user.avatar,
    },
  }))

  // ── Reseñas destacadas (top por likes) ──
  const likedReviews = reviewsWithUsernames.filter(r => r.likeCount > 0)
  const showFeatured = reviewsWithUsernames.length >= FEATURED_MIN_TOTAL_REVIEWS
    && likedReviews.length >= FEATURED_MIN_LIKED_REVIEWS

  const featuredReviews = showFeatured
    ? [...likedReviews]
        .sort((a, b) => b.likeCount - a.likeCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, FEATURED_COUNT)
    : []

  const featuredIds = new Set(featuredReviews.map(r => r.id))
  const remainingReviews = reviewsWithUsernames.filter(r => !featuredIds.has(r.id))

  // ── Datos enriquecidos para IGDBGameDetails ──
  const enrichedData = {
    playerPerspectives: game.playerPerspectives ?? [],
    multiplayerInfo:    game.multiplayerInfo as any[] | null,
    ageRatings:         game.ageRatings as any[] | null,
    languageSupports:   game.languageSupports as any[] | null,
    gameEngine:         game.gameEngine ?? null,
    youtubeVideoIds:    game.youtubeVideoIds ?? [],
    websites:           game.websites as any[] | null,
  }

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

            {/* Géneros */}
            <div className="flex flex-wrap gap-2">
              {game.genre.map((g: string) => (
                <span key={g} className="px-2.5 py-1 bg-gn-primary/8 border border-gn-primary/20 text-red-300 text-xs font-semibold uppercase tracking-wide rounded">
                  {g}
                </span>
              ))}
            </div>

            {/* Themes — estilo diferenciado: solo borde, sin fondo */}
            {game.themes && game.themes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {game.themes.map((theme: string) => (
                  <span key={theme} className="px-2.5 py-1 border border-gn-muted/30 text-gn-muted text-xs font-semibold uppercase tracking-wide rounded hover:border-gn-muted/50 transition-colors">
                    {translateTheme(theme)}
                  </span>
                ))}
              </div>
            )}

            <div>
              <CollectionButton gameId={game.id} />
            </div>

            {game.description && (
              <GameDescription description={game.description} />
            )}

            {/* Stats Bar */}
            <div className="mt-auto bg-gn-primary/5 border border-gn-primary/15 rounded-xl p-4 flex items-center gap-6 flex-wrap">
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-display font-black text-5xl leading-none tracking-[-0.08em]"
                    style={{ color: ratingData.color, fontFamily: 'Orbitron, monospace' }}
                  >
                    {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                  </span>
                  {stats.average > 0 && <span className="text-gn-muted text-lg">/10</span>}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider -mt-0.5 ${ratingData.tailwind}`}>
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

        {/* ── Sección: Contenido adicional (DLCs dados de alta en el catálogo) ── */}
        {dlcGames.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-gn-primary" />
              <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
                // Contenido adicional
              </p>
              <span className="text-gn-muted text-xs">
                {dlcGames.length} {dlcGames.length === 1 ? 'DLC' : 'DLCs'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {dlcGames.map(dlc => (
                <Link
                  key={dlc.slug}
                  href={`/games/${dlc.slug}`}
                  className="group bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden
                             hover:border-gn-primary/30 hover:-translate-y-1
                             hover:shadow-[0_8px_24px_-8px_rgba(230,57,70,0.25)]
                             transition-all duration-200"
                >
                  <div className="relative aspect-[3/4] bg-gn-surface">
                    {dlc.imageUrl ? (
                      <img
                        src={dlc.imageUrl}
                        alt={dlc.title}
                        className="w-full h-full object-cover group-hover:scale-105
                                   transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gn-muted">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide
                                       bg-gn-bg/80 border border-white/10 text-gn-muted backdrop-blur-sm">
                        DLC
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-gn-text text-xs font-semibold leading-tight line-clamp-2
                                  group-hover:text-gn-primary transition-colors">
                      {dlc.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Sección: Tu reseña ── */}
        <div className="mb-6">
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">// Tu opinión</p>
            <h2 className="font-display font-bold text-lg text-gn-text mb-5">
              {userReview ? 'Tu reseña' : 'Escribe una reseña'}
            </h2>
            {session ? (
              <ReviewForm key={userReview?.id ?? 'new'} gameId={game.id} existingReview={userReview} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gn-muted text-sm mb-4">Inicia sesión para compartir tu opinión</p>
                <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors">
                  ▶ Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Sección: Reseñas de la comunidad ── */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">// Reseñas</p>
              <h2 className="font-display font-bold text-lg text-gn-text">Opiniones de la comunidad</h2>
            </div>
            <span className="text-gn-muted text-sm">{stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}</span>
          </div>

          <ReviewList
            reviews={remainingReviews}
            featuredReviews={featuredReviews}
            currentUserId={currentUserId}
          />
        </div>

        {game.igdbId && (
          <IGDBGameDetails
            igdbId={game.igdbId}
            gameSlug={game.slug}
            enrichedData={enrichedData}
          />
        )}
      </div>
    </div>
  )
}