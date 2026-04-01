// src/components/ScreenshotLightbox.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface Screenshot {
  id:  number
  url: string
}

interface Props {
  screenshots: Screenshot[]
}

export default function ScreenshotLightbox({ screenshots }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])

  const prev = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i - 1 + screenshots.length) % screenshots.length)
  }, [screenshots.length])

  const next = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i + 1) % screenshots.length)
  }, [screenshots.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, close, prev, next])

  // Bloquear scroll cuando el lightbox está abierto
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  if (screenshots.length === 0) return null

  const visible = screenshots.slice(0, 6)

  return (
    <>
      {/* ── Grid de screenshots ── */}
      <div>
        <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-3">
          // Screenshots
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visible.map((shot, i) => (
            <button
              key={shot.id}
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-video overflow-hidden rounded-lg
                         bg-gn-surface border border-white/[0.06]
                         hover:border-gn-primary/30 hover:scale-[1.02]
                         transition-all duration-200 group"
            >
              <img
                src={shot.url}
                alt={`Screenshot ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0
                              group-hover:opacity-100 transition-opacity
                              flex items-center justify-center">
                <span className="text-white text-xs font-semibold uppercase tracking-widest">
                  Ver
                </span>
              </div>
              {/* Badge contador en la última si hay más de 6 */}
              {i === 5 && screenshots.length > 6 && (
                <div className="absolute inset-0 bg-black/60 flex items-center
                                justify-center">
                  <span className="text-white font-display font-black text-xl"
                        style={{ fontFamily: 'Orbitron, monospace' }}>
                    +{screenshots.length - 6}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          {/* Imagen */}
          <div
            className="relative max-w-5xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={screenshots[lightboxIndex].url.replace(
                't_screenshot_big', 't_screenshot_huge'
              )}
              alt={`Screenshot ${lightboxIndex + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />

            {/* Contador */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2
                            bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">
                {lightboxIndex + 1} / {screenshots.length}
              </span>
            </div>

            {/* Cerrar */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-sm
                         rounded-full flex items-center justify-center text-white
                         hover:bg-gn-primary/80 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>

            {/* Prev */}
            {screenshots.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10
                           bg-black/60 backdrop-blur-sm rounded-full flex items-center
                           justify-center text-white hover:bg-gn-primary/80 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Next */}
            {screenshots.length > 1 && (
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10
                           bg-black/60 backdrop-blur-sm rounded-full flex items-center
                           justify-center text-white hover:bg-gn-primary/80 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnails navegación inferior */}
          {screenshots.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2
                            flex gap-2 overflow-x-auto max-w-lg px-4">
              {screenshots.map((shot, i) => (
                <button
                  key={shot.id}
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={`flex-shrink-0 w-16 h-10 rounded-md overflow-hidden
                               border-2 transition-all
                               ${i === lightboxIndex
                                 ? 'border-gn-primary opacity-100'
                                 : 'border-transparent opacity-50 hover:opacity-75'
                               }`}
                >
                  <img
                    src={shot.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}