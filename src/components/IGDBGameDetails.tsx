// src/components/IGDBGameDetails.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ScreenshotLightbox from './ScreenshotLightbox'
import { IGDBGame } from '@/lib/igdb'
import { MonitorIcon, UsersIcon, UserIcon, BuildingIcon, TrophyIcon } from 'lucide-react'

interface Props {
  igdbId:   number
  gameSlug: string
}

const GAME_MODE_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  'Single player': {
    label: 'Un jugador',
    icon:  <UserIcon className="w-3.5 h-3.5" />,
  },
  'Multiplayer': {
    label: 'Multijugador',
    icon:  <UsersIcon className="w-3.5 h-3.5" />,
  },
  'Co-operative': {
    label: 'Cooperativo',
    icon:  <UsersIcon className="w-3.5 h-3.5" />,
  },
  'Split screen': {
    label: 'Pantalla dividida',
    icon:  <MonitorIcon className="w-3.5 h-3.5" />,
  },
  'Massively Multiplayer Online (MMO)': {
    label: 'MMO',
    icon:  <UsersIcon className="w-3.5 h-3.5" />,
  },
  'Battle Royale': {
    label: 'Battle Royale',
    icon:  <TrophyIcon className="w-3.5 h-3.5" />,
  },
}

// ── Skeleton ───────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
        <div className="h-3 w-24 bg-gn-subtle/40 rounded animate-pulse mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-gn-subtle/30 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-24 bg-gn-subtle/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gn-subtle/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gn-subtle/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
        <div className="h-3 w-24 bg-gn-subtle/40 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-video bg-gn-subtle/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function IGDBGameDetails({ igdbId, gameSlug }: Props) {
  const [data,       setData]       = useState<IGDBGame | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [localSlugs, setLocalSlugs] = useState<Record<number, string>>({})

  // Cargar datos de IGDB
  useEffect(() => {
    fetch(`/api/igdb/game/${igdbId}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [igdbId])

  // Buscar cuáles juegos similares están en GameNook
  useEffect(() => {
    if (!data?.similar_games?.length) return
    const ids = data.similar_games
      .filter(g => g.cover?.url)
      .slice(0, 6)
      .map(g => g.id)
      .join(',')
    if (!ids) return

    fetch(`/api/games/by-igdb-ids?ids=${ids}`)
      .then(r => r.json())
      .then((games: { igdbId: number; slug: string }[]) => {
        const map: Record<number, string> = {}
        games.forEach(g => { if (g.igdbId) map[g.igdbId] = g.slug })
        setLocalSlugs(map)
      })
      .catch(console.error)
  }, [data])

  if (loading) return <Skeleton />
  if (!data)   return null

  const developer   = data.involved_companies?.find(c => c.developer)?.company.name
  const publisher   = data.involved_companies?.find(c => c.publisher && !c.developer)?.company.name
  const franchise   = data.franchises?.[0]?.name ?? data.collection?.name
  const screenshots = data.screenshots ?? []
  const similar     = (data.similar_games ?? []).filter(g => g.cover?.url).slice(0, 6)

  const hasDetails = data.game_modes?.length || developer || publisher || franchise

  return (
    <div className="space-y-4">

      {/* ── Detalles: modos, desarrolladora, saga ── */}
      {hasDetails && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-gn-primary text-xs font-semibold uppercase
                        tracking-widest mb-5">
            // Detalles
          </p>

          <div className="grid sm:grid-cols-2 gap-6">

            {/* Modos de juego */}
            {data.game_modes && data.game_modes.length > 0 && (
              <div>
                <p className="text-gn-muted text-xs font-semibold uppercase
                               tracking-widest mb-2.5">
                  Modos de juego
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.game_modes.map(mode => {
                    const cfg = GAME_MODE_MAP[mode.name]
                    return (
                      <span
                        key={mode.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5
                                   bg-gn-surface border border-white/[0.06]
                                   rounded-lg text-gn-text text-xs font-semibold"
                      >
                        {cfg?.icon ?? <MonitorIcon className="w-3.5 h-3.5" />}
                        {cfg?.label ?? mode.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Desarrolladora / Publisher */}
            <div className="space-y-3">
              {developer && (
                <div>
                  <p className="text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1">
                    Desarrolladora
                  </p>
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-3.5 h-3.5 text-gn-muted flex-shrink-0" />
                    <span className="text-gn-text text-sm">{developer}</span>
                  </div>
                </div>
              )}
              {publisher && (
                <div>
                  <p className="text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1">
                    Publisher
                  </p>
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-3.5 h-3.5 text-gn-muted flex-shrink-0" />
                    <span className="text-gn-text text-sm">{publisher}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Franquicia / Saga */}
          {franchise && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <p className="text-gn-muted text-xs font-semibold uppercase
                             tracking-widest mb-2">
                Saga / Franquicia
              </p>
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5
                           bg-gn-accent/10 border border-gn-accent/20
                           text-purple-300 text-xs font-semibold
                           uppercase tracking-wide rounded-lg"
              >
                🎮 {franchise}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Screenshots ── */}
      {screenshots.length > 0 && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <ScreenshotLightbox screenshots={screenshots} />
        </div>
      )}

      {/* ── Juegos similares ── */}
      {similar.length > 0 && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-gn-primary text-xs font-semibold uppercase
                        tracking-widest mb-4">
            // Juegos similares
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {similar.map(sg => {
              const coverUrl  = sg.cover?.url ? `https:${sg.cover.url}` : null
              const localSlug = localSlugs[sg.id]

              const card = (
                <div className="group flex flex-col gap-2">
                  {/* Portada 3:4 */}
                  <div
                    className="aspect-[3/4] bg-gn-surface rounded-lg overflow-hidden
                               border border-white/[0.06] transition-all duration-200
                               group-hover:border-gn-primary/40 group-hover:shadow-lg
                               group-hover:shadow-gn-primary/10"
                  >
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={sg.name}
                        className="w-full h-full object-cover group-hover:scale-105
                                   transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                      </div>
                    )}
                  </div>

                  {/* Nombre */}
                  <p
                    className="text-[11px] font-semibold leading-tight line-clamp-2
                               text-gn-muted group-hover:text-gn-text transition-colors"
                  >
                    {sg.name}
                  </p>

                  {/* Badge "En GameNook" si existe */}
                  {localSlug && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide
                                 text-gn-primary"
                    >
                      En GameNook
                    </span>
                  )}
                </div>
              )

              return localSlug ? (
                <Link key={sg.id} href={`/games/${localSlug}`}>
                  {card}
                </Link>
              ) : (
                <div key={sg.id}>{card}</div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}