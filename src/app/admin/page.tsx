// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import AdminGameCard from '@/components/AdminGameCard'
import type { GameStatus } from '@prisma/client'

const PAGE_SIZE = 20

// Campos que AdminGameCard necesita y ni uno más. Antes se hacía un `include`
// completo de TODOS los juegos del catálogo (descripciones, websites, arrays
// de IGDB…) para filtrar en JS y mostrar 5 de cada grupo.
const CARD_SELECT = {
  id:        true,
  title:     true,
  slug:      true,
  status:    true,
  genre:     true,
  createdAt: true,
  submitter: { select: { name: true, email: true } },
} as const

const STATUS_FILTERS = [
  { value: 'ALL',      label: 'Todos'      },
  { value: 'APPROVED', label: 'Aprobados'  },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'PENDING',  label: 'Pendientes' },
] as const

type StatusFilter = typeof STATUS_FILTERS[number]['value']

const isStatusFilter = (v: string): v is StatusFilter =>
  STATUS_FILTERS.some(f => f.value === v)

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
    redirect('/')
  }

  const isAdmin = session.user.role === 'ADMIN'

  const params = await searchParams
  const q            = params.q?.trim().slice(0, 100) ?? ''
  const statusFilter: StatusFilter = isStatusFilter(params.status ?? '')
    ? (params.status as StatusFilter)
    : 'ALL'
  const pageParam = parseInt(params.page ?? '1', 10)
  const page      = Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, 500) : 1

  const searchWhere = q
    ? { title: { contains: q, mode: 'insensitive' as const } }
    : {}

  const listWhere = {
    ...searchWhere,
    ...(statusFilter !== 'ALL' ? { status: statusFilter as GameStatus } : {}),
  }

  // groupBy: los tres contadores en una query, sin traer ni una fila completa.
  const [counts, pending, results, totalResults] = await Promise.all([
    prisma.game.groupBy({ by: ['status'], _count: { _all: true } }),

    // Los pendientes siempre visibles: son la cola de trabajo, no un resultado
    // de búsqueda. Hoy nunca deberían existir (las altas entran APPROVED),
    // pero si alguna vez aparece uno, tiene que saltar a la vista.
    prisma.game.findMany({
      where:   { status: 'PENDING' },
      select:  CARD_SELECT,
      orderBy: { createdAt: 'asc' },
      take:    50,
    }),

    prisma.game.findMany({
      where:   listWhere,
      select:  CARD_SELECT,
      orderBy: { createdAt: 'desc' },
      take:    PAGE_SIZE,
      skip:    (page - 1) * PAGE_SIZE,
    }),

    prisma.game.count({ where: listWhere }),
  ])

  const countFor = (status: string) =>
    counts.find(c => c.status === status)?._count._all ?? 0

  const shown    = (page - 1) * PAGE_SIZE + results.length
  const hasMore  = shown < totalResults

  const buildHref = (overrides: { q?: string; status?: string; page?: number }) => {
    const sp = new URLSearchParams()
    const nextQ      = overrides.q      ?? q
    const nextStatus = overrides.status ?? statusFilter
    const nextPage   = overrides.page   ?? 1
    if (nextQ)                 sp.set('q', nextQ)
    if (nextStatus !== 'ALL')  sp.set('status', nextStatus)
    if (nextPage > 1)          sp.set('page', String(nextPage))
    const qs = sp.toString()
    return `/admin${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Panel de control
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-gn-text">
            Moderación
          </h1>
          <p className="text-gn-muted text-sm mt-1">
            Revisa y gestiona los juegos enviados por la comunidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Pendientes', count: countFor('PENDING'),  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Aprobados',  count: countFor('APPROVED'), color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/20'  },
            { label: 'Rechazados', count: countFor('REJECTED'), color: 'text-red-400',    bg: 'bg-red-500/10    border-red-500/20'    },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
              <div className={`font-display font-black text-2xl sm:text-3xl ${s.color}`}>{s.count}</div>
              <div className="text-gn-muted text-[10px] sm:text-xs uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pendientes — cola de trabajo, siempre arriba y sin filtrar */}
        {pending.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-sm tracking-wide text-yellow-400
                           uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Pendientes de revisión ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* ── Búsqueda + filtro ──
            Sin esto solo se veían los 5 juegos más recientes de cada estado: si
            algo problemático se detectaba semanas después, no había forma de
            llegar a él desde la interfaz. */}
        <section>
          <h2 className="font-display font-bold text-sm tracking-wide text-gn-text
                         uppercase mb-4">
            Buscar en el catálogo
          </h2>

          {/* Formulario GET: la búsqueda vive en la URL, así se puede compartir
              y recargar sin perder el estado. */}
          <form method="GET" action="/admin" className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gn-subtle pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por título…"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                             pl-9 pr-3 py-2.5 text-gn-text text-sm
                             placeholder:text-gn-subtle
                             focus:outline-none focus:border-gn-primary/40
                             focus:ring-1 focus:ring-gn-primary/20 transition-all"
                />
              </div>
              {/* El filtro activo viaja como hidden para no perderse al buscar */}
              {statusFilter !== 'ALL' && (
                <input type="hidden" name="status" value={statusFilter} />
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-gn-primary hover:bg-gn-primary-dark text-white
                           text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
              >
                Buscar
              </button>
              {q && (
                <Link
                  href={buildHref({ q: '' })}
                  className="px-4 py-2.5 border border-white/[0.08] text-gn-muted
                             hover:text-gn-text hover:border-white/20 text-xs font-bold
                             uppercase tracking-wider rounded-lg transition-all
                             flex items-center"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </form>

          <div className="flex gap-2 flex-wrap mb-5">
            {STATUS_FILTERS.map(f => (
              <Link
                key={f.value}
                href={buildHref({ status: f.value })}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase
                            tracking-wide transition-all
                            ${statusFilter === f.value
                              ? 'bg-gn-primary/15 border-gn-primary/40 text-gn-primary'
                              : 'bg-white/[0.03] border-white/[0.08] text-gn-muted hover:text-gn-text hover:border-white/20'
                            }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <p className="text-gn-muted text-xs mb-4">
            {totalResults === 0
              ? 'Sin resultados'
              : `${totalResults} ${totalResults === 1 ? 'juego' : 'juegos'}${q ? ` para «${q}»` : ''}`}
          </p>

          {results.length === 0 ? (
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-8 text-center">
              <p className="text-gn-muted text-sm">
                No hay juegos que coincidan con esa búsqueda.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {results.map(game => (
                  <AdminGameCard key={game.id} game={game} />
                ))}
              </div>

              {(page > 1 || hasMore) && (
                <div className="flex items-center justify-between gap-3 pt-6">
                  {page > 1 ? (
                    <Link
                      href={buildHref({ page: page - 1 })}
                      className="text-gn-muted hover:text-gn-primary text-xs font-semibold
                                 uppercase tracking-widest transition-colors"
                    >
                      ← Anterior
                    </Link>
                  ) : <span />}

                  <span className="text-gn-subtle text-xs">Página {page}</span>

                  {hasMore ? (
                    <Link
                      href={buildHref({ page: page + 1 })}
                      className="text-gn-muted hover:text-gn-primary text-xs font-semibold
                                 uppercase tracking-widest transition-colors"
                    >
                      Siguiente →
                    </Link>
                  ) : <span />}
                </div>
              )}
            </>
          )}

          {!isAdmin && (
            <p className="text-gn-subtle text-xs mt-6">
              Tu rol es MODERATOR: puedes aprobar y rechazar, pero no eliminar juegos.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}