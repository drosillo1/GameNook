// src/components/GamesClient.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SearchIcon, XIcon, SlidersHorizontalIcon } from 'lucide-react'
import { translateGenre } from '@/lib/genres'

// ── Tipos ──────────────────────────────────────────────────────
interface Game {
  id:            string
  title:         string
  slug:          string
  description:   string | null
  imageUrl:      string | null
  releaseDate:   string | null
  genre:         string[]
  platform:      string[]
  averageRating: number | null
  igdbRating:    number | null
  igdbRatingCount: number | null
  createdAt:     string
  _count:        { reviews: number }
}

interface FilterOptions {
  genres:    string[]
  platforms: string[]
  years:     number[]
}

interface Props {
  games:         Game[]
  filterOptions: FilterOptions
}

type SortKey =
  | 'popular'
  | 'rating_desc'
  | 'reviews_desc'
  | 'release_desc'
  | 'release_asc'
  | 'title_asc'
  | 'title_desc'
  | 'added_desc'

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

const YEAR_RANGES = [
  { label: 'Clásicos', min: 0,    max: 1999 },
  { label: '2000s',    min: 2000, max: 2009 },
  { label: '2010s',    min: 2010, max: 2019 },
  { label: '2020s',    min: 2020, max: 9999 },
]

const RATING_META: Record<number, { icon: string; label: string; color: string }> = {
  0:  { icon: '🎮', label: 'Cualquiera',     color: 'text-gn-muted'    },
  3:  { icon: '❤️', label: 'Entretenido+',   color: 'text-blue-400'    },
  5:  { icon: '⚡', label: 'Recomendado+',   color: 'text-purple-400'  },
  7:  { icon: '🏆', label: 'Muy bueno',color: 'text-orange-400'  },
  9:  { icon: '👑', label: 'Imprescidible',   color: 'text-yellow-400'  },
}

function getRatingMeta(rating: number | null) {
  if (!rating) return { icon: '🎮', color: '#6b7280' }
  if (rating >= 9)  return { icon: '👑', color: '#fbbf24' }
  if (rating >= 7)  return { icon: '🏆', color: '#f97316' }
  if (rating >= 5)  return { icon: '⚡', color: '#a855f7' }
  if (rating >= 3)  return { icon: '❤️', color: '#3b82f6' }
  return               { icon: '🎮', color: '#6b7280' }
}

// ── GameCard ───────────────────────────────────────────────────
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
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center
                          justify-center gap-1 text-gn-muted">
            <span className="text-3xl">🎮</span>
          </div>
        )}

        {/* Rating badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                     rounded-md border text-xs font-bold backdrop-blur-sm bg-gn-bg/80"
          style={{
            borderColor: `${meta.color}40`,
            color:        meta.color,
          }}
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
        <h3 className="font-display font-bold text-xs tracking-wide text-gn-text
                       group-hover:text-gn-primary transition-colors truncate mb-1"
            style={{ fontFamily: 'Orbitron, monospace' }}>
          {game.title}
        </h3>

        <div className="flex flex-wrap gap-1 mb-2">
          {game.genre.slice(0, 2).map(g => (
            <span
              key={g}
              className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                         text-red-300 text-[10px] font-semibold uppercase
                         tracking-wide rounded"
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

// ── Sidebar ────────────────────────────────────────────────────
interface SidebarProps {
  sortBy:          SortKey
  setSortBy:       (v: SortKey) => void
  minRating:       number
  setMinRating:    (v: number) => void
  selectedGenres:  string[]
  toggleGenre:     (g: string) => void
  selectedYears:   string[]
  toggleYear:      (y: string) => void
  onReset:         () => void
  hasActiveFilters:boolean
  filterOptions:   FilterOptions
}

function Sidebar({
  sortBy, setSortBy,
  minRating, setMinRating,
  selectedGenres, toggleGenre,
  selectedYears,  toggleYear,
  onReset, hasActiveFilters,
  filterOptions,
}: SidebarProps) {
  const ratingMeta = RATING_META[minRating] ?? RATING_META[0]

  return (
    <aside className="bg-gn-card border border-white/[0.06] rounded-xl p-5
                      sticky top-20 h-fit">

      {/* Ordenación */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase
                      tracking-widest mb-2.5">
          // Ordenar por
        </p>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gn-primary text-xs pointer-events-none">
            ▾
          </span>
        </div>
      </div>

      {/* Rating mínimo */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase
                      tracking-widest mb-2.5">
          // Rating mínimo
        </p>

        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                         border mb-3 text-xs font-bold transition-all duration-200
                         ${minRating === 0
                           ? 'bg-white/[0.03] border-white/[0.08] text-gn-muted'
                           : 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                         }`}>
          <span>{ratingMeta.icon}</span>
          <span className={ratingMeta.color}>
            {minRating === 0 ? 'Cualquiera' : `${minRating}+ — ${ratingMeta.label}`}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={9}
          step={1}
          value={minRating}
          onChange={e => {
            const val = parseInt(e.target.value)
            // Snap a los valores válidos: 0, 3, 5, 7, 9
            const snapped = [0, 3, 5, 7, 9].reduce((prev, curr) =>
              Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
            )
            setMinRating(snapped)
          }}
          className="w-full accent-gn-primary cursor-pointer"
          style={{ accentColor: 'var(--gn-primary)' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gn-subtle">Cualquiera</span>
          <span className="text-[10px] text-gn-subtle">Obra Maestra</span>
        </div>
      </div>

      {/* Géneros */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase
                      tracking-widest mb-2.5">
          // Género
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto
                        scrollbar-thin pr-1">
          {filterOptions.genres.map(g => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold
                          uppercase tracking-wide transition-all duration-150
                          ${selectedGenres.includes(g)
                            ? 'bg-gn-primary/12 border-gn-primary/35 text-red-300'
                            : 'border-white/[0.06] text-gn-muted hover:border-white/15 hover:text-gn-text'
                          }`}
            >
              {translateGenre(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Año */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <p className="text-gn-primary text-[10px] font-bold uppercase
                      tracking-widest mb-2.5">
          // Año
        </p>
        <div className="flex flex-wrap gap-1.5">
          {YEAR_RANGES.map(yr => (
            <button
              key={yr.label}
              onClick={() => toggleYear(yr.label)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold
                          uppercase tracking-wide transition-all duration-150
                          ${selectedYears.includes(yr.label)
                            ? 'bg-gn-accent/12 border-gn-accent/35 text-purple-300'
                            : 'border-white/[0.06] text-gn-muted hover:border-white/15 hover:text-gn-text'
                          }`}
            >
              {yr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
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

// ── Main component ─────────────────────────────────────────────
export default function GamesClient({ games, filterOptions }: Props) {
  const [search,         setSearch]         = useState('')
  const [sortBy,         setSortBy]         = useState<SortKey>('popular')
  const [minRating,      setMinRating]      = useState(0)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYears,  setSelectedYears]  = useState<string[]>([])

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )

  const toggleYear = (y: string) =>
    setSelectedYears(prev =>
      prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]
    )

  const resetFilters = () => {
    setSearch('')
    setSortBy('rating_desc')
    setMinRating(0)
    setSelectedGenres([])
    setSelectedYears([])
  }

  const hasActiveFilters =
    search !== '' ||
    sortBy !== 'rating_desc' ||
    minRating > 0 ||
    selectedGenres.length > 0 ||
    selectedYears.length > 0

  // ── Filtrado y ordenación ───────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...games]

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.genre.some(gen => gen.toLowerCase().includes(q))
      )
    }

    // Rating mínimo
    if (minRating > 0) {
      result = result.filter(g =>
        g.averageRating !== null && g.averageRating >= minRating
      )
    }

    // Géneros — AND: el juego debe tener TODOS los géneros seleccionados
    if (selectedGenres.length > 0) {
      result = result.filter(g =>
        selectedGenres.every(gen => g.genre.includes(gen))
      )
    }

    // Año
    if (selectedYears.length > 0) {
      result = result.filter(g => {
        if (!g.releaseDate) return false
        const year = new Date(g.releaseDate).getFullYear()
        return selectedYears.some(label => {
          const range = YEAR_RANGES.find(r => r.label === label)
          return range ? year >= range.min && year <= range.max : false
        })
      })
    }

    // Ordenación
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          // Popularidad basada en IGDB: cantidad de votos + nota.
          const aPopularity = (a.igdbRatingCount ?? 0) + (a.igdbRating ?? 0)
          const bPopularity = (b.igdbRatingCount ?? 0) + (b.igdbRating ?? 0)

          if (bPopularity !== aPopularity) {
            return bPopularity - aPopularity
          }

          // Uso de fallbacks por si no hay datos IGDB:
          if (b._count.reviews !== a._count.reviews) {
            return b._count.reviews - a._count.reviews
          }
          return (b.averageRating ?? -1) - (a.averageRating ?? -1)
        case 'rating_desc':
          return (b.averageRating ?? -1) - (a.averageRating ?? -1)
        case 'reviews_desc':
          return b._count.reviews - a._count.reviews
        case 'release_desc':
          return new Date(b.releaseDate ?? 0).getTime() -
                 new Date(a.releaseDate ?? 0).getTime()
        case 'release_asc':
          return new Date(a.releaseDate ?? 9999).getTime() -
                 new Date(b.releaseDate ?? 9999).getTime()
        case 'title_asc':
          return a.title.localeCompare(b.title)
        case 'title_desc':
          return b.title.localeCompare(a.title)
        case 'added_desc':
          return new Date(b.createdAt).getTime() -
                 new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return result
  }, [games, search, minRating, selectedGenres, selectedYears, sortBy])

  // ── Active filter pills ─────────────────────────────────────
  const activeFilterPills = [
    ...selectedGenres.map(g => ({
      label: translateGenre(g),
      onRemove: () => toggleGenre(g),
    })),
    ...selectedYears.map(y => ({
      label: y,
      onRemove: () => toggleYear(y),
    })),
    ...(minRating > 0 ? [{
      label: `Rating ≥ ${minRating}`,
      onRemove: () => setMinRating(0),
    }] : []),
  ]

  return (
    <div className="flex gap-6 items-start">

      {/* ── Sidebar ── */}
      <div className="hidden lg:block w-52 flex-shrink-0">
        <Sidebar
          sortBy={sortBy}           setSortBy={setSortBy}
          minRating={minRating}     setMinRating={setMinRating}
          selectedGenres={selectedGenres} toggleGenre={toggleGenre}
          selectedYears={selectedYears}   toggleYear={toggleYear}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          filterOptions={filterOptions}
        />
      </div>

      {/* ── Contenido principal ── */}
      <div className="flex-1 min-w-0">

        {/* Barra superior — búsqueda + contador */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   w-4 h-4 text-gn-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar juegos, géneros..."
              className="w-full pl-10 pr-4 py-2.5 bg-gn-card border border-white/[0.06]
                         rounded-xl text-gn-text placeholder-gn-muted text-sm
                         focus:outline-none focus:border-gn-primary/40
                         focus:ring-1 focus:ring-gn-primary/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gn-muted hover:text-gn-text"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Contador */}
          <p className="text-gn-muted text-sm flex-shrink-0">
            <span className="text-gn-text font-semibold">{filtered.length}</span>
            {' '}de{' '}
            <span className="text-gn-text font-semibold">{games.length}</span>
            {' '}juegos
          </p>
        </div>

        {/* Pills de filtros activos */}
        {activeFilterPills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterPills.map(pill => (
              <button
                key={pill.label}
                onClick={pill.onRemove}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                           bg-gn-primary/10 border border-gn-primary/25 text-red-300
                           text-xs font-semibold uppercase tracking-wide
                           hover:bg-gn-primary/20 transition-colors"
              >
                {pill.label}
                <XIcon className="w-3 h-3" />
              </button>
            ))}
            {activeFilterPills.length > 1 && (
              <button
                onClick={resetFilters}
                className="text-gn-muted hover:text-gn-text text-xs
                           uppercase tracking-wide transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}

        {/* Grid de juegos */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-gn-card border border-white/[0.06]
                          rounded-xl">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="font-display font-bold text-xl text-gn-text mb-2">
              Sin resultados
            </h3>
            <p className="text-gn-muted text-sm mb-6 max-w-xs mx-auto">
              Ningún juego coincide con los filtros aplicados
            </p>
            <button
              onClick={resetFilters}
              className="text-gn-primary hover:text-gn-primary-dark text-sm
                         font-semibold uppercase tracking-wide transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3
                          xl:grid-cols-4 gap-4">
            {filtered.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}