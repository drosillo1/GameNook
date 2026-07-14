// src/components/FollowButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function FollowButton({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
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

  if (!session?.user) return null

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

  return (
    <button
      onClick={handleToggle}
      disabled={loading || saving}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold
                  text-xs uppercase tracking-wider transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed w-full justify-center
                  ${following
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-gn-muted hover:border-yellow-500/30 hover:text-yellow-400'
                  }`}
    >
      {saving ? (
        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        <EyeIcon className="w-3.5 h-3.5" />
      ) : (
        <EyeOffIcon className="w-3.5 h-3.5" />
      )}
      {loading ? 'Cargando...' : following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}