// src/app/collection/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CollectionTabs from '@/components/CollectionTabs'

async function getUserCollection(userId: string) {
  const entries = await prisma.gameCollection.findMany({
    where: { userId },
    include: {
      game: {
        include: {
          reviews: {
            where:  { userId },
            select: { rating: true, content: true, id: true },
          },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return entries.map(e => ({
    ...e,
    game: {
      ...e.game,
      userReview:    e.game.reviews[0] ?? null,
      averageRating: e.game.reviews.length > 0
        ? e.game.reviews.reduce((s, r) => s + r.rating, 0) / e.game.reviews.length
        : null,
    },
  }))
}

export default async function CollectionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/signin')

  const entries = await getUserCollection(session.user.id)

  const grouped = {
    PLAYING:      entries.filter(e => e.status === 'PLAYING'),
    COMPLETED:    entries.filter(e => e.status === 'COMPLETED'),
    WANT_TO_PLAY: entries.filter(e => e.status === 'WANT_TO_PLAY'),
    DROPPED:      entries.filter(e => e.status === 'DROPPED'),
  }

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Tu colección
          </p>
          <h1 className="font-display font-black text-4xl text-gn-text">
            Mi colección
          </h1>
          <p className="text-gn-muted text-sm mt-1">
            {entries.length} juegos en tu biblioteca personal
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Jugando',    count: grouped.PLAYING.length,      color: 'text-green-400',  bg: 'bg-green-500/5  border-green-500/15',  icon: '▶' },
            { label: 'Completados',count: grouped.COMPLETED.length,    color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-500/15', icon: '✓' },
            { label: 'Pendientes', count: grouped.WANT_TO_PLAY.length, color: 'text-blue-400',   bg: 'bg-blue-500/5   border-blue-500/15',   icon: '⏳' },
            { label: 'Abandonados',count: grouped.DROPPED.length,      color: 'text-red-400',    bg: 'bg-red-500/5    border-red-500/15',     icon: '✕' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
              <div className={`font-display font-black text-3xl ${s.color}`}>{s.count}</div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs con los juegos */}
        {entries.length === 0 ? (
          <div className="bg-gn-card border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="font-display font-bold text-xl text-gn-text mb-2">
              Tu colección está vacía
            </h3>
            <p className="text-gn-muted text-sm mb-6 max-w-xs mx-auto">
              Añade juegos a tu colección desde la página de cada juego
            </p>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 bg-gn-primary hover:bg-gn-primary-dark
                         text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5
                         rounded-lg shadow-gn-red transition-all"
            >
              ▶ Explorar juegos
            </Link>
          </div>
        ) : (
          <CollectionTabs grouped={grouped} />
        )}
      </div>
    </div>
  )
}