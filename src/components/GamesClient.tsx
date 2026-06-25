// src/components/GamesClient.tsx
'use client'

import { useState, useTransition, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { XIcon } from 'lucide-react'
import { translateGenre } from '@/lib/genres'
import GameSearchDropdown from './GameSearchDropdown'

import type { Game, FilterOptions, SortKey } from '@/types/games'

interface Props {
  games:         Game[]
  filterOptions: FilterOptions
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular',      label: '🔥 Más populares'   },
  { value: 'rating_desc',  label: 'Mejor valorados'    },
  { value: 'reviews_desc', label: 'Más reseñados'      },
  { value: 'release_desc', label: 'Más recientes'      },
  { value: 'release_asc',  label: 'Más antiguos'       },
  { value: 'title_asc',    label: 'Título A-Z'         },
  { value: 'title_desc',   label: 'Título Z-A'         },
  { value: 'added_desc',   label: 'Recién añadidos'    },
]

const RATING_META: Record<number, { icon: string; label: string; color: string }> = {
  0:  { icon: '🎮', label: 'Cualquiera',     color: 'text-gn-muted'    },
  3:  { icon: '❤️', label: 'Entretenido+',   color: 'text-blue-400'    },
  5:  { icon: '⚡', label: 'Recomendado+',   color: 'text-purple-400'  },
  7:  { icon: '🏆', label: 'Muy bueno',      color: 'text-orange-400'  },
  9:  { icon: '👑', label: 'Imprescindible', color: 'text-yellow-400'  },
}

function getRatingMeta(rating: number | null) {
  if (!rating) return { icon: '🎮', color: '#6b7280' }
  if (rating >= 9)  return { icon: '👑', color: '#fbbf24' }
  if (rating >= 7)  return { icon: '🏆', color: '#f97316' }
  if (rating >= 5)  return { icon: '⚡', color: '#a855f7' }
  if (rating >= 3)  return { icon: '❤️', color: '#3b82f6' }
  return                { icon: '🎮', color: '#6b7280' }
}

function GameCard({ game }: { game: Game }) {
  const meta = getRatingMeta(game.averageRating)
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-gn-card border border-white/[0.06] rounded-xl
                 overflow-hidden hover:border-gn-primary/30 hover:-translate-y-1
                 transition-all duration-200 flex flex-col"
    >
      <div className="aspect-[3/4] bg-gn-surface relative overflow-hidden">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gn-muted">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                     rounded-md border text-xs font-bold backdrop-blur-sm bg-gn-bg/80"
          style={{ borderColor: `${meta.color}40`, color: meta.color }}
        >
          {game.averageRating ? (
            <>
              <span>{meta.icon}</span>
              <span style={{ fontFamily: 'Orbitron, monospace' }}>
                {game.averageRating.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-gn-subtle">—</span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="font-display font-bold text-xs tracking-wide text-gn-text
                     group-hover:text-gn-primary transition-colors truncate mb-1"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {game.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {game.genre.slice(0, 2).map(g => (
            <span
              key={g}
              className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                         text-red-300 text-[10px] font-semibold uppercase tracking-wide rounded"
            >
              {translateGenre(g)}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] text-gn-muted">
            {game._count.reviews}{' '}
            {game._count.reviews === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
      </div>
    </Link>
  )
}

interface SidebarProps {
  draftSort:        SortKey
  onDraftSortChange:    (v: SortKey) => void
  draftRating:      number
  onDraftRatingChange:  (v: number) => void
  draftGenres:      string[]
  onDraftGenreToggle:   (g: string) => void
  onReset:          () => void
  onApply:          () => void
  hasActiveFilters: boolean
  hasPendingChanges: boolean
  filterOptions:    FilterOptions
}

function Sidebar({
  draftSort, onDraftSortChange,
  draftRating, onDraftRatingChange,
  draftGenres, onDraftGenreToggle,
  onReset, onApply,
  hasActiveFilters, hasPendingChanges,
  filterOptions,
}: SidebarProps) {

  const ratingMeta = RATING_META[draftRating] ?? RATING_META[0]

  const snapValue = (val: number) =>
    [0, 3, 5, 7, 9].reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev)

  return (
    <aside className="bg-gn-card border border-white/[0.06] rounded-xl p-5 sticky top-20 h-fit">
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase tracking-widest mb-2.5">
          // Ordenar por
        </p>
        <div className="relative">
          <select
            value={draftSort}
            onChange={e => onDraftSortChange(e.target.value as SortKey)}
            className="w-full bg-gn-surface border border-white/[0.1] rounded-lg
                       px-3 py-2 text-gn-text text-sm appearance-none outline-none
                       hover:border-gn-primary/30 focus:border-gn-primary/40
                       focus:ring-1 focus:ring-gn-primary/20 transition-colors
                       cursor-pointer font-semibold"
            style={{ colorScheme: 'dark' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-gn-surface text-gn-text">
                {o.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gn-primary text-xs pointer-events-none">
            ▾
          </span>
        </div>
      </div>

      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase tracking-widest mb-2.5">
          // Rating mínimo
        </p>
        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border mb-3
                         text-xs font-bold transition-all duration-200
                         ${draftRating === 0
                           ? 'bg-white/[0.03] border-white/[0.08] text-gn-muted'
                           : 'bg-orange-500/10 border-orange-500/25 text-orange-400'}`}>
          <span>{ratingMeta.icon}</span>
          <span className={ratingMeta.color}>
            {draftRating === 0 ? 'Cualquiera' : `${draftRating}+ — ${ratingMeta.label}`}
          </span>
        </div>
        <input
          type="range" min={0} max={9} step={1} value={draftRating}
          onChange={e => onDraftRatingChange(snapValue(parseInt(e.target.value)))}
          className="w-full accent-gn-primary cursor-pointer"
          style={{ accentColor: 'var(--gn-primary)' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gn-subtle">Cualquiera</span>
          <span className="text-[10px] text-gn-subtle">Obra Maestra</span>
        </div>
      </div>

      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase tracking-widest mb-2.5">
          // Género
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {filterOptions.genres.map(g => (
            <button
              key={g}
              onClick={() => onDraftGenreToggle(g)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold
                          uppercase tracking-wide transition-all duration-150
                          ${draftGenres.includes(g)
                            ? 'bg-gn-primary/12 border-gn-primary/35 text-red-300'
                            : 'border-white/[0.06] text-gn-muted hover:border-white/15 hover:text-gn-text'}`}
            >
              {translateGenre(g)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onApply}
        disabled={!hasPendingChanges}
        className="w-full flex items-center justify-center gap-2 py-2.5 mb-2
                   bg-gn-primary hover:bg-gn-primary-dark disabled:bg-white/[0.04]
                   disabled:text-gn-subtle disabled:cursor-not-allowed
                   text-white text-xs font-bold uppercase tracking-wide rounded-lg
                   transition-all duration-150"
      >
        {hasPendingChanges ? 'Aplicar filtros' : 'Filtros aplicados'}
      </button>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2 border
                     border-white/[0.06] hover:border-gn-primary/30 text-gn-muted
                     hover:text-gn-primary text-xs font-semibold uppercase
                     tracking-wide rounded-lg transition-all duration-150"
        >
          <XIcon className="w-3 h-3" />
          Limpiar filtros
        </button>
      )}
    </aside>
  )
}

export default function GamesClient({ games, filterOptions }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Filtros APLICADOS — leídos directamente de la URL (fuente de verdad)
  const appliedSort = (searchParams.get('sort') ?? 'popular') as SortKey
  const appliedGenres = searchParams.getAll('genre')
  const appliedRating = parseInt(searchParams.get('rating') ?? '0')

  // Filtros BORRADOR — estado local, no navegan hasta pulsar "Aplicar"
  const [draftSort, setDraftSort]     = useState<SortKey>(appliedSort)
  const [draftGenres, setDraftGenres] = useState<string[]>(appliedGenres)
  const [draftRating, setDraftRating] = useState<number>(appliedRating)

  const [showFilters, setShowFilters] = useState(false)

  // Si la URL cambia por fuera (navegación, botón atrás), resincroniza el borrador
  useEffect(() => {
    setDraftSort(appliedSort)
    setDraftGenres(appliedGenres)
    setDraftRating(appliedRating)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const hasPendingChanges =
    draftSort !== appliedSort ||
    draftRating !== appliedRating ||
    draftGenres.length !== appliedGenres.length ||
    draftGenres.some(g => !appliedGenres.includes(g))

  const hasActiveFilters = appliedSort !== 'popular' || appliedGenres.length > 0 || appliedRating > 0

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (draftSort !== 'popular') params.set('sort', draftSort)
    draftGenres.forEach(g => params.append('genre', g))
    if (draftRating > 0) params.set('rating', draftRating.toString())

    startTransition(() => {
      router.push(`/games?${params.toString()}`)
    })
    setShowFilters(false)
  }

  const resetFilters = () => {
    setDraftSort('popular')
    setDraftGenres([])
    setDraftRating(0)
    startTransition(() => {
      router.push('/games')
    })
    setShowFilters(false)
  }

  const toggleDraftGenre = (genre: string) => {
    setDraftGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const activeFilterPills = useMemo(() => [
    ...appliedGenres.map(g => ({
      label: translateGenre(g),
      onRemove: () => {
        const params = new URLSearchParams()
        if (appliedSort !== 'popular') params.set('sort', appliedSort)
        appliedGenres.filter(x => x !== g).forEach(x => params.append('genre', x))
        if (appliedRating > 0) params.set('rating', appliedRating.toString())
        startTransition(() => router.push(`/games?${params.toString()}`))
      },
    })),
    ...(appliedRating > 0 ? [{
      label: `Rating ≥ ${appliedRating}`,
      onRemove: () => {
        const params = new URLSearchParams()
        if (appliedSort !== 'popular') params.set('sort', appliedSort)
        appliedGenres.forEach(g => params.append('genre', g))
        startTransition(() => router.push(`/games?${params.toString()}`))
      },
    }] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [appliedGenres, appliedRating, appliedSort])

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar desktop */}
      <div className="hidden lg:block w-52 flex-shrink-0">
        <Sidebar
          draftSort={draftSort}
          onDraftSortChange={setDraftSort}
          draftRating={draftRating}
          onDraftRatingChange={setDraftRating}
          draftGenres={draftGenres}
          onDraftGenreToggle={toggleDraftGenre}
          onReset={resetFilters}
          onApply={applyFilters}
          hasActiveFilters={hasActiveFilters}
          hasPendingChanges={hasPendingChanges}
          filterOptions={filterOptions}
        />
      </div>

      {/* Drawer móvil */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gn-bg overflow-y-auto p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gn-primary text-xs font-bold uppercase tracking-widest">
                // Filtros
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg
                           bg-white/[0.08] border border-white/20 text-gn-text
                           hover:bg-white/[0.14] transition-colors"
                aria-label="Cerrar filtros"
              >
                <XIcon className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <Sidebar
              draftSort={draftSort}
              onDraftSortChange={setDraftSort}
              draftRating={draftRating}
              onDraftRatingChange={setDraftRating}
              draftGenres={draftGenres}
              onDraftGenreToggle={toggleDraftGenre}
              onReset={resetFilters}
              onApply={applyFilters}
              hasActiveFilters={hasActiveFilters}
              hasPendingChanges={hasPendingChanges}
              filterOptions={filterOptions}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Botón filtros móvil */}
          <button
            onClick={() => setShowFilters(true)}
            className={`lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl border
                        text-sm font-semibold transition-all flex-shrink-0
                        ${hasActiveFilters
                          ? 'bg-gn-primary/10 border-gn-primary/30 text-gn-primary'
                          : 'bg-gn-card border-white/[0.06] text-gn-muted'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4h18M6 8h12M9 12h6M11 16h2" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-gn-primary rounded-full text-white
                               text-[10px] flex items-center justify-center font-bold">
                {activeFilterPills.length}
              </span>
            )}
          </button>

          {/* Buscador — independiente de los filtros, navega directo al juego */}
          <GameSearchDropdown />

          <p className="text-gn-muted text-sm flex-shrink-0">
            <span className="text-gn-text font-semibold">{games.length}</span>
            {' '}juegos
          </p>
        </div>

        {activeFilterPills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterPills.map(pill => (
              <button
                key={pill.label}
                onClick={pill.onRemove}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gn-primary/8
                           border border-gn-primary/25 rounded-lg text-xs font-semibold
                           text-gn-text hover:bg-gn-primary/12 transition-colors"
              >
                {pill.label}
                <XIcon className="w-3 h-3 opacity-60" />
              </button>
            ))}
            {activeFilterPills.length > 1 && (
              <button
                onClick={resetFilters}
                className="text-gn-muted hover:text-gn-text text-xs uppercase tracking-wide transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}

        <div className={isPending ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
          {games.length === 0 ? (
            <div className="text-center py-20 bg-gn-card border border-white/[0.06] rounded-xl">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="font-display font-bold text-xl text-gn-text mb-2">Sin resultados</h3>
              <p className="text-gn-muted text-sm mb-6 max-w-xs mx-auto">
                Ningún juego coincide con los filtros aplicados.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-gn-primary hover:text-gn-primary-dark text-sm
                             font-semibold uppercase tracking-wide transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}