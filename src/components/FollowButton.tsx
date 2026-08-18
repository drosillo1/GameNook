// src/components/FollowButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon } from 'lucide-react'
import type { CollectionStatus } from '@prisma/client'

type FollowVariant = 'hero' | 'card'

interface Props {
  gameId: string

  initialStatus: CollectionStatus | null

  isAuthenticated: boolean
  variant?: FollowVariant
}


export default function FollowButton({
  gameId,
  initialStatus,
  isAuthenticated,
  variant = 'card',
}: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [following, setFollowing] = useState(initialStatus === 'WISHLIST')
  const [saving,    setSaving]    = useState(false)


  useEffect(() => {
    setFollowing(initialStatus === 'WISHLIST')
  }, [initialStatus])

  // ── Geometría por variante ──
  const shape = variant === 'hero'
    ? 'w-full sm:w-auto min-h-[44px] px-5 py-3 justify-center sm:justify-start'
    : 'w-full min-h-[44px] px-3 py-2 justify-center'

  const base = `flex items-center gap-2 rounded-lg border font-bold
                text-xs uppercase tracking-wider transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed ${shape}`

  // ── Sin sesión: mismo botón, pero lleva al login ──
  if (!isAuthenticated) {
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

  const style = following
    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/[0.16]'
    : variant === 'hero'
      ? 'bg-gn-primary border-transparent text-white hover:bg-gn-primary-dark shadow-[0_4px_20px_-4px_rgba(230,57,70,0.5)]'
      : 'bg-white/[0.04] border-white/[0.10] text-gn-text hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/[0.06]'

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={saving}
      title={following ? 'Dejar de seguir este juego' : 'Seguir este juego'}
      className={`${base} ${style}`}
    >
      {saving ? (
        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <EyeIcon className="w-4 h-4" />
      )}
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}