// src/components/YouTubeFacade.tsx
'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  videoId: string
  title?:  string
}

export default function YouTubeFacade({ videoId, title }: Props) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title ?? 'Trailer'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className="relative aspect-video w-full rounded-lg overflow-hidden bg-black
                 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gn-primary"
    >
      {/* YouTube thumbnail */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title ?? 'Trailer'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gn-primary/90 group-hover:bg-gn-primary
                        group-hover:scale-110 transition-all duration-200
                        flex items-center justify-center shadow-lg shadow-gn-primary/30">
          <Play className="w-7 h-7 text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Title overlay */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-xs font-semibold truncate">{title}</p>
        </div>
      )}
    </button>
  )
}