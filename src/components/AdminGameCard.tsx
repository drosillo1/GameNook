// src/components/AdminGameCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckIcon, XIcon, ExternalLinkIcon } from 'lucide-react'

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

export default function AdminGameCard({ game }: AdminGameCardProps) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true)
    try {
      await fetch(`/api/games/${game.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    PENDING:  { label: 'Pendiente', cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    APPROVED: { label: 'Aprobado',  cls: 'bg-green-500/10  border-green-500/30  text-green-400'  },
    REJECTED: { label: 'Rechazado', cls: 'bg-red-500/10    border-red-500/30    text-red-400'    },
  }[game.status] ?? { label: game.status, cls: '' }

  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-xl px-5 py-4
                    flex items-center gap-4 flex-wrap">

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
      </div>
    </div>
  )
}