// src/components/IGDBSearch.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchIcon, LoaderIcon } from 'lucide-react'
import { IGDBGame } from '@/lib/igdb'

interface IGDBSearchProps {
   onSelect: (game: IGDBGame) => Promise<void>
}

export default function IGDBSearch({ onSelect }: IGDBSearchProps) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<IGDBGame[]>([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [selected, setSelected] = useState<IGDBGame | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
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
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/igdb/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.games ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = async (game: IGDBGame) => {
    setSelected(game)
    setQuery(game.name)
    setOpen(false)
    await onSelect(game)  // ← añade await
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setResults([])
  }

  return (
    <div ref={wrapperRef} className="relative">

      {/* Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                               w-4 h-4 text-gn-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Busca un juego en IGDB..."
          className="w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.06]
                     rounded-lg text-gn-text text-sm placeholder-gn-muted outline-none
                     focus:border-gn-primary/40 focus:ring-1 focus:ring-gn-primary/20
                     transition-all"
        />

        {/* Spinner / clear */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {loading ? (
            <LoaderIcon className="w-4 h-4 text-gn-muted animate-spin" />
          ) : selected ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gn-muted hover:text-gn-text transition-colors text-lg leading-none"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown resultados */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gn-card border
                        border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50">
          {results.map(game => {
            const year = game.first_release_date
              ? new Date(game.first_release_date * 1000).getFullYear()
              : null
            const coverUrl = game.cover?.url ?? null

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelect(game)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left
                           hover:bg-white/[0.04] transition-colors
                           border-b border-white/[0.04] last:border-0"
              >
                {/* Portada miniatura */}
                <div className="w-10 h-14 bg-gn-surface rounded-md overflow-hidden
                                flex-shrink-0 flex items-center justify-center">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🎮</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gn-text text-sm font-semibold truncate">
                    {game.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {year && (
                      <span className="text-gn-muted text-xs">{year}</span>
                    )}
                    {game.genres?.slice(0, 2).map(g => (
                      <span
                        key={g.id}
                        className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                                   text-red-400 text-[10px] font-semibold uppercase
                                   tracking-wide rounded"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                  {game.summary && (
                    <p className="text-gn-subtle text-xs mt-1 line-clamp-1">
                      {game.summary}
                    </p>
                  )}
                </div>

                {/* Rating IGDB si existe */}
                {game.rating && (
                  <div className="flex-shrink-0 text-center">
                    <div className="font-display font-black text-sm text-gn-primary"
                         style={{ fontFamily: 'Orbitron, monospace' }}>
                      {Math.round(game.rating / 10)}
                    </div>
                    <div className="text-gn-subtle text-[10px]">IGDB</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Sin resultados */}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gn-card border
                        border-white/[0.08] rounded-xl p-4 text-center shadow-xl z-50">
          <p className="text-gn-muted text-sm">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}

      {/* Badge — juego seleccionado */}
      {selected && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-500/10
                        border border-green-500/25 rounded-lg">
          <span className="text-green-400 text-xs">✓</span>
          <span className="text-green-400 text-xs font-semibold">
            Datos importados desde IGDB
          </span>
          {selected.cover?.url && (
            <img
              src={selected.cover.url}
              alt=""
              className="w-6 h-8 object-cover rounded ml-auto"
            />
          )}
        </div>
      )}
    </div>
  )
}