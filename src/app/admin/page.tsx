// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminGameCard from '@/components/AdminGameCard'

async function getPendingGames() {
  return prisma.game.findMany({
    where:   { status: 'PENDING' },
    include: { submitter: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

async function getAllGames() {
  return prisma.game.findMany({
    include: { submitter: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
    redirect('/')
  }

  const [pending, all] = await Promise.all([getPendingGames(), getAllGames()])
  const approved = all.filter(g => g.status === 'APPROVED')
  const rejected = all.filter(g => g.status === 'REJECTED')

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Panel de control
          </p>
          <h1 className="font-display font-black text-4xl text-gn-text">
            Moderación
          </h1>
          <p className="text-gn-muted text-sm mt-1">
            Revisa y gestiona los juegos enviados por la comunidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pendientes', count: pending.length,  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Aprobados',  count: approved.length, color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/20'  },
            { label: 'Rechazados', count: rejected.length, color: 'text-red-400',    bg: 'bg-red-500/10    border-red-500/20'    },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
              <div className={`font-display font-black text-3xl ${s.color}`}>{s.count}</div>
              <div className="text-gn-muted text-xs uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pendientes */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-sm tracking-wide text-yellow-400
                         uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pendientes de revisión ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-8 text-center">
              <p className="text-gn-muted text-sm">No hay juegos pendientes. ¡Todo al día! ✅</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>

        {/* Aprobados recientes */}
        {approved.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-sm tracking-wide text-green-400
                           uppercase mb-4">
              Aprobados recientes
            </h2>
            <div className="space-y-3">
              {approved.slice(0, 5).map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Rechazados recientes */}
        {rejected.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-sm tracking-wide text-red-400
                           uppercase mb-4">
              Rechazados recientes
            </h2>
            <div className="space-y-3">
              {rejected.slice(0, 5).map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}