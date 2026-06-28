// src/app/profile/[username]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarIcon, GamepadIcon, SettingsIcon, MapPinIcon, MonitorIcon,
  Swords, Joystick, Compass, Car, Spade, Trophy as TrophyIcon, Brain,
  Hourglass, Castle, Axe as AxeIcon, Sparkles, Hand, Users, Music,
  BookOpen, Footprints, MousePointer2, Puzzle, ScrollText, Target as TargetIcon,
  Settings2, Crosshair, Ghost,
} from 'lucide-react'
import { RatingDistribution } from '@/components/RatingDistribution'
import ProfileReviewsList from '@/components/ProfileReviewsList'
import UserAvatarDisplay from '@/components/UserAvatarDisplay'
import { getTopGenres, getReviewsThisYear } from '@/lib/profileStats'
import { translateGenre, getGenreIconLucide, getGenreColor } from '@/lib/genres'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

const GENRE_ICON_MAP_LUCIDE: Record<string, any> = {
  Swords, Joystick, Compass, Car, Spade, Trophy: TrophyIcon, Brain,
  Hourglass, Castle, Axe: AxeIcon, Sparkles, Hand, Users, Music,
  BookOpen, Footprints, MousePointer2, Puzzle, ScrollText, Target: TargetIcon,
  Settings2, Crosshair, Ghost, Gamepad2: GamepadIcon,
}

async function getProfileData(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        select: {
          id: true, rating: true, content: true, createdAt: true,
          likeCount: true,
          game: {
            select: {
              id: true, title: true, slug: true, imageUrl: true, genre: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      collection: {
        select: {
          status: true,
          game: { select: { genre: true } },
        },
      },
    },
  })
}

const FEATURED_MIN_LIKED_REVIEWS = 3
const FEATURED_MIN_TOTAL_REVIEWS = 4
const FEATURED_COUNT = 3

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const [session, user] = await Promise.all([
    getServerSession(authOptions),
    getProfileData(username),
  ])

  if (!user) notFound()

  const isOwnProfile = session?.user?.id === user.id

  const reviews      = user.reviews
  const totalReviews = reviews.length
  const avgRating    = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : 0

  const levelCounts = {
    'Obra Maestra':   reviews.filter(r => r.rating === 10).length,
    'Imprescindible': reviews.filter(r => r.rating === 9).length,
    'Muy Bueno':      reviews.filter(r => r.rating >= 7 && r.rating <= 8).length,
    'Recomendado':    reviews.filter(r => r.rating >= 5 && r.rating <= 6).length,
    'Entretenido':    reviews.filter(r => r.rating >= 3 && r.rating <= 4).length,
    'Jugable':        reviews.filter(r => r.rating <= 2).length,
  }

  const collectionStats = {
    playing:    user.collection.filter(c => c.status === 'PLAYING').length,
    completed:  user.collection.filter(c => c.status === 'COMPLETED').length,
    wantToPlay: user.collection.filter(c => c.status === 'WANT_TO_PLAY').length,
    dropped:    user.collection.filter(c => c.status === 'DROPPED').length,
    total:      user.collection.length,
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('es-ES', {
    month: 'long', year: 'numeric',
  })

  const topGenres       = getTopGenres(user.collection, 3)
  const reviewsThisYear = getReviewsThisYear(reviews)

  const reviewsForList = reviews.map(r => ({
    id:        r.id,
    rating:    r.rating,
    content:   r.content,
    createdAt: r.createdAt.toISOString(),
    likeCount: r.likeCount,
    game:      r.game,
  }))

  const likedReviews = reviewsForList.filter(r => r.likeCount > 0)
  const showFeatured = totalReviews >= FEATURED_MIN_TOTAL_REVIEWS
    && likedReviews.length >= FEATURED_MIN_LIKED_REVIEWS

  const featuredReviews = showFeatured
    ? [...likedReviews]
        .sort((a, b) => b.likeCount - a.likeCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, FEATURED_COUNT)
    : []

  const featuredIds = new Set(featuredReviews.map(r => r.id))
  const remainingReviews = reviewsForList.filter(r => !featuredIds.has(r.id))

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── HEADER ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <UserAvatarDisplay image={user.image} name={user.name} size={80} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-black text-2xl sm:text-3xl text-gn-text truncate">
                      {user.name ?? 'Gamer'}
                    </h1>
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase
                               tracking-widest flex-shrink-0 ${user.role === 'ADMIN'
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          : 'bg-blue-500/10   border-blue-500/30   text-blue-400'
                        }`}>
                        {user.role === 'ADMIN' ? '👑 Admin' : '🛡 Moderador'}
                      </span>
                    )}
                  </div>
                  <p className="text-gn-muted text-sm mt-0.5">@{user.username}</p>
                </div>

                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-white/[0.04] border
                               border-white/[0.08] hover:border-white/15 text-gn-muted
                               hover:text-gn-text text-xs font-semibold uppercase
                               tracking-wider px-3 py-2 rounded-lg transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar perfil</span>
                  </Link>
                )}
              </div>

              {user.bio && (
                <p className="text-gn-text text-sm mt-3 leading-relaxed break-words">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-gn-muted text-xs flex-wrap">
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  Miembro desde {memberSince}
                </span>
              </div>

              {user.favoritePlatforms.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <MonitorIcon className="w-3.5 h-3.5 text-gn-muted flex-shrink-0" />
                  {user.favoritePlatforms.map(platform => (
                    <span
                      key={platform}
                      className="px-2 py-1 bg-white/[0.04] border border-white/[0.08]
                                 rounded-md text-gn-muted text-[11px] font-semibold"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS RESEÑAS ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { label: 'Reseñas', value: totalReviews, color: 'text-gn-primary' },
              { label: 'Rating medio', value: avgRating > 0 ? avgRating.toFixed(1) : '—', color: 'text-yellow-400' },
              { label: 'Reseñas este año', value: reviewsThisYear, color: 'text-cyan-400' },
              { label: 'Imprescindibles', value: levelCounts['Imprescindible'] + levelCounts['Obra Maestra'], color: 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="text-center px-2">
                <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
                <div className="text-gn-muted text-xs uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GÉNEROS FAVORITOS (lucide + color por género) ── */}
        {topGenres.length > 0 && (
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 mb-6">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-4">
      // Géneros favoritos
            </p>
            <div className="grid grid-cols-3 gap-3">
              {topGenres.map(({ genre, count }, i) => {
                const translated = translateGenre(genre)
                const iconName = getGenreIconLucide(translated)
                const IconComp = GENRE_ICON_MAP_LUCIDE[iconName]
                const color = getGenreColor(translated)
                const isTop = i === 0

                return (
                  <div
                    key={genre}
                    className={`flex flex-col items-center text-center gap-2.5 rounded-xl border p-4
                        transition-all
                        ${isTop ? 'border-white/[0.1]' : 'border-white/[0.06]'}`}
                    style={{ background: `${color}0d` }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        width: isTop ? 56 : 44,
                        height: isTop ? 56 : 44,
                        background: `${color}1f`,
                        boxShadow: isTop ? `0 0 16px ${color}50` : 'none',
                      }}
                    >
                      {IconComp && (
                        <IconComp
                          style={{ color, width: isTop ? 26 : 20, height: isTop ? 26 : 20 }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color }}>
                        {translated}
                      </p>
                      <p className="text-gn-muted text-xs mt-0.5">{count} juegos</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STATS COLECCIÓN ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
              // {isOwnProfile ? 'Mi colección' : 'Colección'} · {collectionStats.total} juegos
            </p>
            {isOwnProfile && (
              <Link
                href="/collection"
                className="text-xs text-gn-muted hover:text-gn-text transition-colors
                           uppercase tracking-wider font-semibold"
              >
                Ver todo →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Jugando',     count: collectionStats.playing,    color: 'text-green-400'},
              { label: 'Completados', count: collectionStats.completed,  color: 'text-purple-400'},
              { label: 'Pendientes',  count: collectionStats.wantToPlay, color: 'text-blue-400'},
              { label: 'Abandonados', count: collectionStats.dropped,    color: 'text-red-400'},
            ].map(s => (
              <div key={s.label}
                   className="bg-gn-surface/50 rounded-lg p-3 flex items-center gap-3">
                <div>
                  <div className={`font-display font-black text-xl ${s.color}`}>{s.count}</div>
                  <div className="text-gn-muted text-[11px] uppercase tracking-wide mt-0.5">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISTRIBUCIÓN DE NIVELES ── */}
        {totalReviews > 0 && (
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 mb-6">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-4">
              // Distribución de puntuaciones
            </p>
            <RatingDistribution 
              total={totalReviews}
              levels={[
                { label: 'Obra Maestra',   iconName: 'Crown' as const,  color: '#fbbf24', count: levelCounts['Obra Maestra']   },
                { label: 'Imprescindible', iconName: 'Trophy' as const, color: '#f97316', count: levelCounts['Imprescindible'] },
                { label: 'Muy Bueno',      iconName: 'Medal' as const,  color: '#06b6d4', count: levelCounts['Muy Bueno']      },
                { label: 'Recomendado',    iconName: 'Shield' as const, color: '#a855f7', count: levelCounts['Recomendado']    },
                { label: 'Entretenido',    iconName: 'Heart' as const,  color: '#3b82f6', count: levelCounts['Entretenido']    },
                { label: 'Jugable',        iconName: 'Sword' as const,  color: '#6b7280', count: levelCounts['Jugable']        },
              ]}
            />
          </div>
        )}

        {/* ── RESEÑAS ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-white/[0.06]">
            <p className="font-display font-bold text-sm tracking-wide text-gn-text">
              {isOwnProfile ? 'Mis reseñas' : 'Reseñas'}
            </p>
            <span className="text-gn-muted text-xs">{totalReviews} reseñas</span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-gn-text font-semibold mb-1">
                {isOwnProfile ? 'Aún no has escrito reseñas' : 'Aún no hay reseñas'}
              </p>
              {isOwnProfile && (
                <>
                  <p className="text-gn-muted text-sm mb-6">
                    Explora los juegos disponibles y comparte tu opinión
                  </p>
                  <Link
                    href="/games"
                    className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                               text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5
                               rounded-lg shadow-gn-red transition-all duration-200"
                  >
                    <GamepadIcon className="w-4 h-4" />
                    Explorar juegos
                  </Link>
                </>
              )}
            </div>
          ) : (
            <ProfileReviewsList reviews={remainingReviews} featuredReviews={featuredReviews} />
          )}
        </div>

      </div>
    </div>
  )
}