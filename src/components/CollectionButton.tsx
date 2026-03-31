// src/components/CollectionButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookmarkIcon, CheckIcon, PlayIcon, XIcon, ClockIcon, ChevronDownIcon } from 'lucide-react'

type CollectionStatus = 'WANT_TO_PLAY' | 'PLAYING' | 'COMPLETED' | 'DROPPED'

const STATUS_CONFIG: Record<CollectionStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
}> = {
  WANT_TO_PLAY: {
    label:  'Pendiente',
    icon:   <ClockIcon className="w-3.5 h-3.5" />,
    color:  'text-blue-400',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  PLAYING: {
    label:  'Jugando',
    icon:   <PlayIcon className="w-3.5 h-3.5" />,
    color:  'text-green-400',
    bg:     'bg-green-500/10',
    border: 'border-green-500/30',
  },
  COMPLETED: {
    label:  'Completado',
    icon:   <CheckIcon className="w-3.5 h-3.5" />,
    color:  'text-purple-400',
    bg:     'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  DROPPED: {
    label:  'Abandonado',
    icon:   <XIcon className="w-3.5 h-3.5" />,
    color:  'text-red-400',
    bg:     'bg-red-500/10',
    border: 'border-red-500/30',
  },
}

export default function CollectionButton({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<CollectionStatus | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [open,          setOpen]          = useState(false)
  const [saving,        setSaving]        = useState(false)

  // Cargar estado actual
  useEffect(() => {
    if (!session?.user) { setLoading(false); return }
    fetch(`/api/collection/${gameId}`)
      .then(r => r.json())
      .then(data => setCurrentStatus(data.entry?.status ?? null))
      .finally(() => setLoading(false))
  }, [gameId, session])

  if (!session?.user) return null

  const handleSelect = async (status: CollectionStatus) => {
    setSaving(true)
    setOpen(false)
    try {
      await fetch('/api/collection', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ gameId, status }),
      })
      setCurrentStatus(status)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setSaving(true)
    setOpen(false)
    try {
      await fetch(`/api/collection/${gameId}`, { method: 'DELETE' })
      setCurrentStatus(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const active = currentStatus ? STATUS_CONFIG[currentStatus] : null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading || saving}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-bold
                    text-xs uppercase tracking-wider transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${active
                      ? `${active.bg} ${active.border} ${active.color}`
                      : 'bg-white/[0.04] border-white/[0.08] text-gn-muted hover:border-white/20 hover:text-gn-text'
                    }`}
      >
        {saving ? (
          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
        ) : active ? (
          active.icon
        ) : (
          <BookmarkIcon className="w-3.5 h-3.5" />
        )}
        {loading ? 'Cargando...' : active ? active.label : 'Añadir a colección'}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-52 bg-gn-card border
                          border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-20">

            <div className="p-1.5">
              {(Object.entries(STATUS_CONFIG) as [CollectionStatus, typeof STATUS_CONFIG[CollectionStatus]][]).map(([status, cfg]) => (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                              text-xs font-semibold uppercase tracking-wide text-left
                              transition-colors duration-150
                              ${currentStatus === status
                                ? `${cfg.bg} ${cfg.color}`
                                : 'text-gn-muted hover:bg-white/[0.04] hover:text-gn-text'
                              }`}
                >
                  <span className={currentStatus === status ? cfg.color : 'text-gn-subtle'}>
                    {cfg.icon}
                  </span>
                  {cfg.label}
                  {currentStatus === status && (
                    <CheckIcon className="w-3 h-3 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {currentStatus && (
              <>
                <div className="h-px bg-white/[0.06] mx-1" />
                <div className="p-1.5">
                  <button
                    onClick={handleRemove}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                               text-xs font-semibold uppercase tracking-wide text-left
                               text-gn-muted hover:bg-red-500/10 hover:text-red-400
                               transition-colors duration-150"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    Eliminar de colección
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}