import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon } from 'lucide-react'
import { RatingBadge } from '@/components/RatingBadge'
import { RatingDistribution } from '@/components/RatingDistribution'

async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviews: {
        include: {
          game: {
            select: {
              id:       true,
              title:    true,
              slug:     true,
              imageUrl: true,
              genre:    true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      collection: {
        select: { status: true },
      },
    },
  })
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/signin')

  const user = await getUserData(session.user.id)
  if (!user) redirect('/')

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

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── HEADER ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8 mb-6
                        flex items-center gap-6 flex-wrap">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? 'Avatar'}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gn-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gn-primary/20 flex items-center
                            justify-center text-gn-primary text-3xl font-black">
              {user.name?.[0] ?? '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
              // Perfil de gamer
            </p>
            <h1 className="font-display font-black text-3xl text-gn-text truncate">
              {user.name ?? 'Gamer'}
            </h1>
            <p className="text-gn-muted text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-2 text-gn-muted text-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
              Miembro desde {memberSince}
            </div>
          </div>

          {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase
                             tracking-widest flex-shrink-0 ${
              user.role === 'ADMIN'
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-blue-500/10   border-blue-500/30   text-blue-400'
            }`}>
              {user.role === 'ADMIN' ? '👑 Admin' : '🛡 Moderador'}
            </div>
          )}
        </div>

        {/* ── STATS RESEÑAS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Reseñas',
              value: totalReviews,
              color: 'text-gn-primary',
              bg:    'bg-gn-primary/5 border-gn-primary/15',
            },
            {
              label: 'Rating medio',
              value: avgRating > 0 ? avgRating.toFixed(1) : '—',
              color: 'text-yellow-400',
              bg:    'bg-yellow-500/5 border-yellow-500/15',
            },
            {
              label: 'Obras maestras',
              value: levelCounts['Obra Maestra'],
              color: 'text-yellow-400',
              bg:    'bg-yellow-500/5 border-yellow-500/15',
            },
            {
              label: 'Imprescindibles',
              value: levelCounts['Imprescindible'],
              color: 'text-orange-400',
              bg:    'bg-orange-500/5 border-orange-500/15',
            },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
              <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── STATS COLECCIÓN ── */}
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest">
              // Mi colección · {collectionStats.total} juegos
            </p>
            <Link
              href="/collection"
              className="text-xs text-gn-muted hover:text-gn-text transition-colors
                         uppercase tracking-wider font-semibold"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Jugando',     count: collectionStats.playing,    color: 'text-green-400',  dot: 'bg-green-400'  },
              { label: 'Completados', count: collectionStats.completed,  color: 'text-purple-400', dot: 'bg-purple-400' },
              { label: 'Pendientes',  count: collectionStats.wantToPlay, color: 'text-blue-400',   dot: 'bg-blue-400'   },
              { label: 'Abandonados', count: collectionStats.dropped,    color: 'text-red-400',    dot: 'bg-red-400'    },
            ].map(s => (
              <div key={s.label}
                   className="bg-gn-surface/50 rounded-lg p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
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
              Mis reseñas
            </p>
            <span className="text-gn-muted text-xs">{totalReviews} reseñas</span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-gn-text font-semibold mb-1">
                Aún no has escrito reseñas
              </p>
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
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {reviews.map(review => (
                  <Link
                    key={review.id}
                    href={`/games/${review.game.slug}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02]
                               transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-10 bg-gn-surface rounded-lg overflow-hidden
                                    flex-shrink-0 flex items-center justify-center">
                      {review.game.imageUrl ? (
                        <img
                          src={review.game.imageUrl}
                          alt={review.game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🎮</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gn-text text-sm font-semibold truncate
                                    group-hover:text-gn-primary transition-colors">
                        {review.game.title}
                      </p>
                      {review.content ? (
                        <p className="text-gn-muted text-xs truncate mt-0.5">
                          {review.content}
                        </p>
                      ) : (
                        <p className="text-gn-subtle text-xs mt-0.5">Sin comentario</p>
                      )}
                      <p className="text-gn-subtle text-[11px] mt-1">
                        {new Date(review.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Rating */}
                    <RatingBadge rating={review.rating} />
                  </Link>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}