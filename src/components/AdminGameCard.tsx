// src/components/AdminGameCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckIcon, XIcon, ExternalLinkIcon, Trash2Icon, AlertTriangleIcon } from 'lucide-react'

interface AdminGameCardProps {
  game: {
    id:          string
    title:       string
    slug:        string
    status:      string
    genre:       string[]
    createdAt:   Date
    submitter:   { name: string | null; email: string } | null
  }
}

interface DeleteImpact {
  reviews:    number
  collection: number
}

export default function AdminGameCard({ game }: AdminGameCardProps) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  // Estado de la confirmación de borrado. `impact` se pide al servidor al abrir:
  // borrar arrastra las entradas de colección de otros usuarios en cascada, así
  // que la decisión no debería tomarse sin ver a cuántos afecta.
  const [confirming, setConfirming] = useState(false)
  const [impact,     setImpact]     = useState<DeleteImpact | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No se ha podido actualizar el juego')
        return
      }
      router.refresh()
    } catch (e) {
      console.error(e)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const openConfirm = async () => {
    setConfirming(true)
    setImpact(null)
    setError(null)
    try {
      const res = await fetch(`/api/games/${game.id}`)
      if (!res.ok) {
        setError('No se ha podido comprobar el impacto del borrado')
        return
      }
      const data = await res.json()
      setImpact(data.counts)
    } catch (e) {
      console.error(e)
      setError('Error de conexión')
    }
  }

  const confirmDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games/${game.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No se ha podido eliminar el juego')
        return
      }
      setConfirming(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    PENDING:  { label: 'Pendiente', cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    APPROVED: { label: 'Aprobado',  cls: 'bg-green-500/10  border-green-500/30  text-green-400'  },
    REJECTED: { label: 'Rechazado', cls: 'bg-red-500/10    border-red-500/30    text-red-400'    },
  }[game.status] ?? { label: game.status, cls: '' }

  // Con reseñas, el borrado está bloqueado en el servidor (Review.game es
  // Restrict). Se refleja aquí para no ofrecer un botón que va a fallar.
  const blockedByReviews = impact !== null && impact.reviews > 0

  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-xl px-5 py-4">
      <div className="flex items-center gap-4 flex-wrap">

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-sm text-gn-text truncate">
              {game.title}
            </span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${statusConfig.cls}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="text-gn-muted text-xs flex items-center gap-3 flex-wrap">
            {game.submitter && (
              <span>por {game.submitter.name ?? game.submitter.email}</span>
            )}
            <span>{new Date(game.createdAt).toLocaleDateString('es-ES')}</span>
            {game.genre.slice(0, 2).map(g => (
              <span key={g} className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                                       text-red-400 rounded text-[10px] uppercase tracking-wide">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Link
            href={`/games/${game.slug}`}
            target="_blank"
            className="p-2 rounded-lg border border-white/[0.06] text-gn-muted
                       hover:text-gn-text hover:border-white/15 transition-all"
            title="Ver juego"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Link>

          {game.status !== 'APPROVED' && (
            <button
              type="button"
              onClick={() => updateStatus('APPROVED')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border
                         border-green-500/30 text-green-400 rounded-lg text-xs font-bold
                         uppercase tracking-wide hover:bg-green-500/20 disabled:opacity-40
                         transition-all"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Aprobar
            </button>
          )}

          {game.status !== 'REJECTED' && (
            <button
              type="button"
              onClick={() => updateStatus('REJECTED')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border
                         border-red-500/30 text-red-400 rounded-lg text-xs font-bold
                         uppercase tracking-wide hover:bg-red-500/20 disabled:opacity-40
                         transition-all"
            >
              <XIcon className="w-3.5 h-3.5" />
              Rechazar
            </button>
          )}

          {/* Borrado: acción destructiva y secundaria — icono discreto, no botón
              con etiqueta. Rechazar es la vía normal de moderación. */}
          <button
            type="button"
            onClick={openConfirm}
            disabled={loading || confirming}
            title="Eliminar definitivamente"
            className="p-2 rounded-lg border border-white/[0.06] text-gn-subtle
                       hover:text-red-400 hover:border-red-500/30 disabled:opacity-40
                       transition-all"
          >
            <Trash2Icon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Confirmación de borrado ── */}
      {confirming && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-start gap-2.5 mb-3">
            <AlertTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gn-text">
              <p className="font-semibold mb-1">Eliminar «{game.title}» definitivamente</p>

              {impact === null && !error && (
                <p className="text-gn-muted text-xs">Comprobando impacto…</p>
              )}

              {impact !== null && (
                <ul className="text-xs text-gn-muted space-y-1">
                  <li>
                    Reseñas de usuarios:{' '}
                    <span className={impact.reviews > 0 ? 'text-red-400 font-semibold' : 'text-gn-text'}>
                      {impact.reviews}
                    </span>
                  </li>
                  <li>
                    En la colección de{' '}
                    <span className={impact.collection > 0 ? 'text-yellow-400 font-semibold' : 'text-gn-text'}>
                      {impact.collection}
                    </span>{' '}
                    {impact.collection === 1 ? 'usuario' : 'usuarios'}
                    {impact.collection > 0 && ' — esas entradas se borrarán en cascada'}
                  </li>
                </ul>
              )}

              {blockedByReviews && (
                <p className="text-xs text-red-400 mt-2">
                  No se puede eliminar un juego con reseñas. Usa «Rechazar»: lo retira
                  del catálogo sin destruir el contenido de los usuarios, y es reversible.
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-3">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={loading || impact === null || blockedByReviews}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 border border-transparent
                         text-white rounded-lg text-xs font-bold uppercase tracking-wide
                         hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
              {loading ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
            <button
              type="button"
              onClick={() => { setConfirming(false); setError(null); setImpact(null) }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-gn-muted
                         text-xs font-bold uppercase tracking-wide hover:text-gn-text
                         hover:border-white/20 disabled:opacity-40 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Errores de aprobar/rechazar fuera del panel de confirmación */}
      {error && !confirming && (
        <p className="text-xs text-red-400 mt-3">{error}</p>
      )}
    </div>
  )
}