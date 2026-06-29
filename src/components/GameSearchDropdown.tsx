// src/components/GameSearchDropdown.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, LoaderIcon, XIcon, PlusIcon } from 'lucide-react'

interface SearchGame {
  id: string
  title: string
  slug: string
  imageUrl: string | null
  releaseDate: string | null
}

export default function GameSearchDropdown() {
  const router = useRouter()

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchGame[]>([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounce de búsqueda — espera 400ms tras dejar de escribir
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current || undefined)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/games/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.games ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current || undefined)
  }, [query])

  const handleSelect = (game: SearchGame) => {
    setOpen(false)
    setQuery('')
    router.push(`/games/${game.slug}`)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const handleAddGame = () => {
    setOpen(false)
    router.push(`/games/add?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[200px]">

      {/* Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                               w-4 h-4 text-gn-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar juegos..."
          className="w-full pl-10 pr-9 py-2.5 bg-gn-card border border-white/[0.06]
                     rounded-xl text-gn-text placeholder-gn-muted text-sm
                     focus:outline-none focus:border-gn-primary/40
                     focus:ring-1 focus:ring-gn-primary/20 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <LoaderIcon className="w-4 h-4 text-gn-muted animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gn-muted hover:text-gn-text transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown resultados */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gn-card border
                        border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50
                        max-h-96 overflow-y-auto">
          {results.map(game => {
            const year = game.releaseDate
              ? new Date(game.releaseDate).getFullYear()
              : null

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelect(game)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left
                           hover:bg-white/[0.04] transition-colors
                           border-b border-white/[0.04] last:border-0"
              >
                <div className="w-10 h-14 bg-gn-surface rounded-md overflow-hidden
                                flex-shrink-0 flex items-center justify-center">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🎮</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gn-text text-sm font-semibold truncate">
                    {game.title}
                  </p>
                  {year && (
                    <span className="text-gn-muted text-xs">{year}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Sin resultados — sugerir agregar el juego */}
      {open && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gn-card border
                        border-white/[0.08] rounded-xl p-4 text-center shadow-xl z-50">
          <p className="text-gn-muted text-sm mb-3">
            No se encontraron resultados para "{query}"
          </p>
          <button
            type="button"
            onClick={handleAddGame}
            className="inline-flex items-center gap-1.5 bg-gn-primary hover:bg-gn-primary-dark
                       text-white text-xs font-bold uppercase tracking-wider
                       px-4 py-2 rounded-lg shadow-gn-red transition-all duration-200
                       hover:-translate-y-0.5"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Agregar "{query}"
          </button>
        </div>
      )}
    </div>
  )
}