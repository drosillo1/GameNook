// src/components/RecommendationsClient.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SparklesIcon, TrendingUpIcon, XIcon, ChevronRightIcon } from 'lucide-react'
import GameCard from './GameCard'
import { translateGenre, getGenreColor } from '@/lib/genres'
import type { RecommendedGame } from '@/lib/recommendations'

const PRIORITY_CARDS = 4

interface Props {
  games:           RecommendedGame[]
  availableGenres: string[]
}

interface Reason {
  /** Texto previo al título, en color secundario */
  prefix:       string
  /** Título del juego origen — destacado. Vacío en recomendaciones no personalizadas */
  highlight:    string
  /** Sufijo tipo "+2" cuando hay más juegos origen */
  extra:        string
  /** Texto completo — atributo `title` para hover en desktop */
  full:         string
  personalized: boolean
  /** Si true, la explicación es pulsable y abre la hoja con los juegos origen */
  expandable:   boolean
}

/**
 * Construye la explicación de cada recomendación.
 *
 * Copy: UN solo juego origen visible + contador ("+2"). En móvil la card mide
 * ~160px y dos títulos no caben. La lista completa se consulta pulsando la
 * explicación (hoja desplegable) — el `title` de hover no sirve en táctil.
 */
function buildReason(game: RecommendedGame): Reason {
  if (game.source === 'similar' && game.becauseOf.length > 0) {
    const [first, ...rest] = game.becauseOf
    const titles = game.becauseOf.map(o => o.title)

    const full = rest.length === 0
      ? `Porque completaste ${titles[0]}`
      : rest.length === 1
        ? `Porque completaste ${titles[0]} y ${titles[1]}`
        : `Porque completaste ${titles.slice(0, -1).join(', ')} y ${titles[titles.length - 1]}`

    return {
      prefix:       'Similar a',
      highlight:    first.title,
      extra:        rest.length > 0 ? ` +${rest.length}` : '',
      full,
      personalized: true,
      expandable:   true,
    }
  }

  if (game.source === 'genre') {
    return {
      prefix:       'Popular en tus géneros',
      highlight:    '',
      extra:        '',
      full:         'Popular entre tus géneros favoritos',
      personalized: true,
      expandable:   false,
    }
  }

  return {
    prefix:       'Popular en GameNook',
    highlight:    '',
    extra:        '',
    full:         'Popular en GameNook',
    personalized: false,
    expandable:   false,
  }
}

/**
 * Hoja con los juegos origen de una recomendación.
 * Bottom sheet en móvil (donde no existe el hover), modal centrado en desktop.
 * Se renderiza una sola instancia a nivel de lista, no una por card.
 */
function OriginSheet({
  game,
  onClose,
}: {
  game:    RecommendedGame
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Por qué te recomendamos ${game.title}`}
        className="relative w-full sm:max-w-sm bg-gn-card border border-white/[0.08]
                   rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden
                   max-h-[80vh] flex flex-col"
      >
        <div className="flex items-start gap-3 p-5 border-b border-white/[0.06]">
          <div className="min-w-0 flex-1">
            <p className="text-gn-primary text-[10px] font-bold uppercase tracking-widest mb-1">
              // Por qué te lo recomendamos
            </p>
            <p className="font-display font-bold text-base text-gn-text leading-tight">
              {game.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-lg
                       bg-white/[0.06] border border-white/[0.1] text-gn-text
                       hover:bg-white/[0.12] transition-colors"
          >
            <XIcon className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <p className="flex items-center gap-1.5 text-gn-muted text-xs mb-3 px-1">
            <SparklesIcon className="w-3.5 h-3.5 text-gn-accent flex-shrink-0" />
            Porque completaste{' '}
            <span className="text-gn-text font-semibold">
              {game.becauseOf.length}
            </span>
            {game.becauseOf.length === 1 ? ' juego similar' : ' juegos similares'}
          </p>

          <div className="flex flex-col gap-1">
            {game.becauseOf.map(origin => (
              <Link
                key={origin.slug}
                href={`/games/${origin.slug}`}
                onClick={onClose}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg
                           border border-white/[0.06] hover:border-gn-primary/30
                           hover:bg-white/[0.03] transition-all group"
              >
                <span className="text-gn-text text-sm font-semibold truncate
                                 group-hover:text-gn-primary transition-colors">
                  {origin.title}
                </span>
                <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-gn-subtle
                                             group-hover:text-gn-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationsClient({ games, availableGenres }: Props) {
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [openGameId,  setOpenGameId]  = useState<string | null>(null)

  const filtered = useMemo(
    () => activeGenre ? games.filter(g => g.genre.includes(activeGenre)) : games,
    [games, activeGenre]
  )

  const openGame = openGameId
    ? games.find(g => g.id === openGameId) ?? null
    : null

  // Solo tiene sentido ofrecer el filtro si hay variedad real
  const showFilter = availableGenres.length > 1

  return (
    <div>
      {showFilter && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveGenre(null)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold
                          uppercase tracking-wide transition-all duration-150
                          ${activeGenre === null
                            ? 'bg-gn-primary/12 border-gn-primary/35 text-red-300'
                            : 'border-white/[0.06] text-gn-muted hover:border-white/15 hover:text-gn-text'}`}
            >
              Todos
            </button>

            {availableGenres.map(g => {
              const translated = translateGenre(g)
              const color      = getGenreColor(translated)
              const isActive   = activeGenre === g

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGenre(isActive ? null : g)}
                  className="px-2.5 py-1 rounded-md border text-[11px] font-semibold
                             uppercase tracking-wide transition-all duration-150"
                  style={isActive
                    ? { borderColor: `${color}59`, backgroundColor: `${color}1f`, color }
                    : { borderColor: 'rgba(255,255,255,0.06)', color: 'var(--gn-muted)' }}
                >
                  {translated}
                </button>
              )
            })}

            {activeGenre && (
              <button
                type="button"
                onClick={() => setActiveGenre(null)}
                className="flex items-center gap-1 text-gn-muted hover:text-gn-text
                           text-[11px] uppercase tracking-wide transition-colors ml-1"
              >
                <XIcon className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>

          <p className="text-gn-muted text-xs mt-3">
            <span className="text-gn-text font-semibold">{filtered.length}</span>
            {' '}{filtered.length === 1 ? 'recomendación' : 'recomendaciones'}
            {activeGenre && ` en ${translateGenre(activeGenre)}`}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gn-card border border-white/[0.06] rounded-xl">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-display font-bold text-lg text-gn-text mb-2">
            Nada en ese género
          </h3>
          <p className="text-gn-muted text-sm mb-5 max-w-xs mx-auto">
            Ninguna de tus recomendaciones actuales pertenece a ese género.
          </p>
          <button
            type="button"
            onClick={() => setActiveGenre(null)}
            className="text-gn-primary hover:text-gn-primary-dark text-sm
                       font-semibold uppercase tracking-wide transition-colors"
          >
            Ver todas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game, i) => {
            const reason = buildReason(game)

            // Contenido de la explicación — común a la versión pulsable y la estática.
            // Altura fija de dos líneas para que el grid no se desalinee.
            const label = (
              <>
                {reason.personalized
                  ? <SparklesIcon   className="w-3 h-3 mt-[2px] flex-shrink-0 text-gn-accent" />
                  : <TrendingUpIcon className="w-3 h-3 mt-[2px] flex-shrink-0 text-gn-muted" />
                }
                <span
                  className={`text-[10px] leading-[1.3] line-clamp-2 text-left
                              ${reason.personalized ? 'text-gn-accent/80' : 'text-gn-muted'}`}
                >
                  {reason.prefix}
                  {reason.highlight && (
                    <>
                      {' '}
                      <span className="font-semibold text-gn-accent underline
                                       decoration-dotted decoration-gn-accent/40 underline-offset-2">
                        {reason.highlight}
                      </span>
                      {reason.extra && (
                        <span className="font-semibold text-gn-muted">{reason.extra}</span>
                      )}
                    </>
                  )}
                </span>
              </>
            )

            return (
              <div key={game.id} className="flex flex-col">
                {reason.expandable ? (
                  <button
                    type="button"
                    onClick={() => setOpenGameId(game.id)}
                    title={reason.full}
                    aria-label={`${reason.full}. Ver los juegos que originan esta recomendación`}
                    className="h-8 mb-1.5 flex items-start gap-1 min-w-0 w-full
                               hover:opacity-80 transition-opacity"
                  >
                    {label}
                  </button>
                ) : (
                  <div className="h-8 mb-1.5 flex items-start gap-1 min-w-0" title={reason.full}>
                    {label}
                  </div>
                )}

                <GameCard game={game} priority={i < PRIORITY_CARDS} />
              </div>
            )
          })}
        </div>
      )}

      {openGame && (
        <OriginSheet game={openGame} onClose={() => setOpenGameId(null)} />
      )}
    </div>
  )
}