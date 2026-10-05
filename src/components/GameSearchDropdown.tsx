// src/components/GameSearchDropdown.tsx
'use client'

import { useState, useEffect, useRef, useId, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, LoaderIcon, XIcon, PlusIcon } from 'lucide-react'

interface SearchGame {
  id: string
  title: string
  slug: string
  imageUrl: string | null
  releaseDate: string | null
}

interface Props {
  className?:  string
  autoFocus?:  boolean
  onNavigate?: () => void
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS      = 400

export default function GameSearchDropdown({
  className  = 'flex-1 min-w-[200px]',
  autoFocus  = false,
  onNavigate,
}: Props) {
  const router = useRouter()
  const listId = useId()

  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<SearchGame[]>([])
  const [loading,     setLoading]     = useState(false)
  const [open,        setOpen]        = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  // Debounce de búsqueda — espera 400ms tras dejar de escribir.
  // El AbortController descarta respuestas de queries ya superadas: sin él, una
  // respuesta lenta de "ze" podía llegar después de la de "zelda" y pisarla.
  useEffect(() => {
    const q = query.trim()

    if (q.length < MIN_QUERY_LENGTH) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        // Un 429/500 NO es "sin resultados": no ofrecer "Agregar" por un error.
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setResults(data.games ?? [])
        setActiveIndex(-1)
        setOpen(true)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setResults([])
        setOpen(false)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const goTo = (href: string) => {
    setOpen(false)
    onNavigate?.()
    router.push(href)
  }

  const handleSelect = (game: SearchGame) => {
    setQuery('')
    goTo(`/games/${game.slug}`)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const handleAddGame = () => {
    goTo(`/games/add?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation()
        setOpen(false)
      }
      return
    }

    if (!open || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(results[activeIndex >= 0 ? activeIndex : 0])
    }
  }

  const optionId = (i: number) => `${listId}-opt-${i}`

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>

      {/* Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                               w-4 h-4 text-gn-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder="Buscar juegos..."
          aria-label="Buscar juegos"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
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
              aria-label="Borrar búsqueda"
              className="text-gn-muted hover:text-gn-text transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown resultados */}
      {open && results.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-gn-card border
                     border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50
                     max-h-[min(24rem,60vh)] overflow-y-auto"
        >
          {results.map((game, i) => {
            const year = game.releaseDate
              ? new Date(game.releaseDate).getFullYear()
              : null

            return (
              <button
                key={game.id}
                id={optionId(i)}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleSelect(game)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                            transition-colors border-b border-white/[0.04] last:border-0 ${
                  i === activeIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
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
      {open && !loading && results.length === 0 && query.trim().length >= MIN_QUERY_LENGTH && (
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