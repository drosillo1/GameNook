// src/components/FollowButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon } from 'lucide-react'

type FollowVariant = 'hero' | 'card'

// El icono es SIEMPRE Eye, en los dos estados. Antes se usaba EyeOff para "Seguir"
export default function FollowButton({
  gameId,
  variant = 'card',
}: {
  gameId: string
  variant?: FollowVariant
}) {
  const { data: session } = useSession()
  const router   = useRouter()
  const pathname = usePathname()

  const [following, setFollowing] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    if (!session?.user) { setLoading(false); return }
    fetch(`/api/collection/${gameId}`)
      .then(r => r.json())
      .then(data => setFollowing(data.entry?.status === 'WISHLIST'))
      .finally(() => setLoading(false))
  }, [gameId, session])

  // ── Geometría por variante ──
  const shape = variant === 'hero'
    ? 'w-full sm:w-auto min-h-[44px] px-5 py-3 justify-center sm:justify-start'
    : 'w-full min-h-[44px] px-3 py-2 justify-center'

  const base = `flex items-center gap-2 rounded-lg border font-bold
                text-xs uppercase tracking-wider transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed ${shape}`

  // ── Sin sesión: mismo botón, pero lleva al login ──
  if (!session?.user) {
    const idleStyle = variant === 'hero'
      ? 'bg-gn-primary border-transparent text-white hover:bg-gn-primary-dark shadow-[0_4px_20px_-4px_rgba(230,57,70,0.5)]'
      : 'bg-white/[0.04] border-white/[0.10] text-gn-text hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/[0.06]'

    return (
      <Link
        href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
        className={`${base} ${idleStyle}`}
      >
        <EyeIcon className="w-4 h-4" />
        Seguir
      </Link>
    )
  }

  const handleToggle = async () => {
    setSaving(true)
    try {
      if (following) {
        await fetch(`/api/collection/${gameId}`, { method: 'DELETE' })
        setFollowing(false)
      } else {
        await fetch('/api/collection', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ gameId, status: 'WISHLIST' }),
        })
        setFollowing(true)
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // Mientras carga, estilo neutro en ambas variantes: evita el parpadeo
  // rojo/gris → amarillo cuando el juego ya estaba seguido.
  const style = loading
    ? 'bg-white/[0.04] border-white/[0.08] text-gn-muted'
    : following
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/[0.16]'
      : variant === 'hero'
        ? 'bg-gn-primary border-transparent text-white hover:bg-gn-primary-dark shadow-[0_4px_20px_-4px_rgba(230,57,70,0.5)]'
        : 'bg-white/[0.04] border-white/[0.10] text-gn-text hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/[0.06]'

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || saving}
      title={following ? 'Dejar de seguir este juego' : 'Seguir este juego'}
      className={`${base} ${style}`}
    >
      {saving ? (
        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <EyeIcon className="w-4 h-4" />
      )}
      {loading ? 'Cargando...' : following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}