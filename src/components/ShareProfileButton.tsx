'use client'

import { Share2Icon } from 'lucide-react'
import { toast } from '@/lib/toast'

interface ShareProfileButtonProps {
  username: string
  displayName: string
}

export default function ShareProfileButton({ username, displayName }: ShareProfileButtonProps) {
  const url = `https://gamenook.es/profile/${username}`

  const handleShare = async () => {
    const shareData = {
      title: `${displayName} en GameNook`,
      text: `Mira el perfil de ${displayName} en GameNook`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err: any) {
        // El usuario canceló el diálogo — no es un error real
        if (err.name === 'AbortError') return
        fallbackCopy()
      }
    } else {
      fallbackCopy()
    }
  }

  const fallbackCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace del perfil copiado')
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Compartir perfil"
      className="flex-shrink-0 flex items-center justify-center bg-white/[0.04] border
                 border-white/[0.08] hover:border-white/15 text-gn-muted
                 hover:text-gn-text w-9 h-9 rounded-lg transition-colors"
    >
      <Share2Icon className="w-4 h-4" />
    </button>
  )
}