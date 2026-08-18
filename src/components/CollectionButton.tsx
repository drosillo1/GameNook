// src/components/CollectionButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookmarkIcon, CheckIcon, PlayIcon, XIcon, ClockIcon, ChevronDownIcon, EyeIcon } from 'lucide-react'
import type { CollectionStatus } from '@prisma/client'

// El tipo se IMPORTA de Prisma en vez de redeclararse. Antes había una unión
// literal local: dos definiciones del mismo concepto acaban desincronizándose,
// y un valor nuevo en el enum no daría error aquí. `import type` se borra en
// compilación, así que no arrastra @prisma/client al bundle del cliente.

const STATUS_CONFIG: Record<CollectionStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
}> = {
  WANT_TO_PLAY: {
    label:  'Pendiente',
    icon:   <ClockIcon className="w-4 h-4" />,
    color:  'text-blue-400',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  PLAYING: {
    label:  'Jugando',
    icon:   <PlayIcon className="w-4 h-4" />,
    color:  'text-green-400',
    bg:     'bg-green-500/10',
    border: 'border-green-500/30',
  },
  COMPLETED: {
    label:  'Completado',
    icon:   <CheckIcon className="w-4 h-4" />,
    color:  'text-purple-400',
    bg:     'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  DROPPED: {
    label:  'Abandonado',
    icon:   <XIcon className="w-4 h-4" />,
    color:  'text-red-400',
    bg:     'bg-red-500/10',
    border: 'border-red-500/30',
  },
  WISHLIST: {
    label:  'Siguiendo',
    icon:   <EyeIcon className="w-4 h-4" />,
    color:  'text-yellow-400',
    bg:     'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
}

// Los estados de "juego" van primero, WISHLIST al final separado
const PLAY_STATUSES: CollectionStatus[] = ['WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED']

interface Props {
  gameId: string

  initialStatus: CollectionStatus | null
  /** Sesión resuelta en el servidor (antes: useSession, con parpadeo al montar). */
  isAuthenticated: boolean
}

export default function CollectionButton({ gameId, initialStatus, isAuthenticated }: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<CollectionStatus | null>(initialStatus)
  const [open,          setOpen]          = useState(false)
  const [saving,        setSaving]        = useState(false)

  // Resincroniza cuando el servidor manda un estado nuevo (tras router.refresh()).
  useEffect(() => {
    setCurrentStatus(initialStatus)
  }, [initialStatus])

  // Cerrar con Escape — el backdrop cubre el click fuera, pero no el teclado.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!isAuthenticated) return null

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

  const triggerStyle = active
    ? `${active.bg} ${active.border} ${active.color}`
    : 'bg-gn-primary border-transparent text-white hover:bg-gn-primary-dark shadow-[0_4px_20px_-4px_rgba(230,57,70,0.5)]'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={saving}
        aria-expanded={open}
        className={`w-full sm:w-auto min-h-[44px] flex items-center justify-center sm:justify-start
                    gap-2 px-5 py-3 rounded-lg border font-bold
                    text-xs uppercase tracking-wider transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${triggerStyle}`}
      >
        {saving ? (
          <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
        ) : active ? (
          active.icon
        ) : (
          <BookmarkIcon className="w-4 h-4" />
        )}
        {active ? active.label : 'Añadir a colección'}
        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* max-h + scroll: con 6 opciones, en un móvil pequeño y con la
              página scrolleada el menú podría salirse por debajo del viewport. */}
          <div className="absolute left-0 right-0 sm:right-auto top-full mt-2 sm:w-52
                          bg-gn-card border border-white/[0.08] rounded-xl
                          overflow-y-auto max-h-[60vh] shadow-xl z-20">

            {/* Estados de juego */}
            <div className="p-1.5">
              {PLAY_STATUSES.map(status => {
                const cfg = STATUS_CONFIG[status]
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleSelect(status)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
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
                )
              })}
            </div>

            {/* Separador + Seguir */}
            <div className="h-px bg-white/[0.06] mx-1" />
            <div className="p-1.5">
              <button
                type="button"
                onClick={() => handleSelect('WISHLIST')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                            text-xs font-semibold uppercase tracking-wide text-left
                            transition-colors duration-150
                            ${currentStatus === 'WISHLIST'
                              ? `${STATUS_CONFIG.WISHLIST.bg} ${STATUS_CONFIG.WISHLIST.color}`
                              : 'text-gn-muted hover:bg-yellow-500/10 hover:text-yellow-400'
                            }`}
              >
                <span className={currentStatus === 'WISHLIST' ? 'text-yellow-400' : 'text-gn-subtle'}>
                  <EyeIcon className="w-4 h-4" />
                </span>
                Seguir
                {currentStatus === 'WISHLIST' && (
                  <CheckIcon className="w-3 h-3 ml-auto" />
                )}
              </button>
            </div>

            {currentStatus && (
              <>
                <div className="h-px bg-white/[0.06] mx-1" />
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                               text-xs font-semibold uppercase tracking-wide text-left
                               text-gn-muted hover:bg-red-500/10 hover:text-red-400
                               transition-colors duration-150"
                  >
                    <XIcon className="w-4 h-4" />
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