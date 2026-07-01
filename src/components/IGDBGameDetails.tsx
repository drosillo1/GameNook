// src/components/IGDBGameDetails.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ScreenshotLightbox from './ScreenshotLightbox'
import YouTubeFacade from './YouTubeFacade'
import { IGDBGame } from '@/lib/igdb'
import { translatePerspective } from '@/lib/perspectives'
import {
  MonitorIcon, UsersIcon, UserIcon, BuildingIcon, TrophyIcon,
  ChevronDown, ChevronUp, Eye, Gamepad2, ShieldCheck, Globe2,
  Cpu, ExternalLink, ShoppingCart,
} from 'lucide-react'

// ── Tipos para datos enriquecidos de BD ──
interface MultiplayerEntry {
  onlineMax:      number
  offlineMax:     number
  onlineCoopMax:  number
  offlineCoopMax: number
  campaignCoop:   boolean
  lanCoop:        boolean
  onlineCoop:     boolean
  offlineCoop:    boolean
  splitscreen:    boolean
  platform:       string | null
}

interface AgeRatingEntry {
  category: number  // 1=ESRB, 2=PEGI
  rating:   number
}

interface LanguageSupportEntry {
  language: string
  type:     string  // "Audio", "Subtitles", "Interface"
}

interface WebsiteEntry {
  category: number
  url:      string
}

export interface EnrichedData {
  playerPerspectives: string[]
  multiplayerInfo:    MultiplayerEntry[] | null
  ageRatings:         AgeRatingEntry[] | null
  languageSupports:   LanguageSupportEntry[] | null
  gameEngine:         string | null
  youtubeVideoIds:    string[]
  websites:           WebsiteEntry[] | null
}

// ── Constantes de mapeo ──

const PEGI_LABELS: Record<number, string> = {
  1: 'PEGI 3',  2: 'PEGI 7',  3: 'PEGI 12',  4: 'PEGI 16',  5: 'PEGI 18',
}

const ESRB_LABELS: Record<number, string> = {
  1: 'RP',  2: 'EC',  3: 'E',  4: 'E10+',  5: 'T',  6: 'M',  7: 'AO',
}

const STORE_CATEGORIES: Record<number, { label: string; icon: string }> = {
  1:  { label: 'Web oficial',  icon: '🌐' },
  13: { label: 'Steam',        icon: '🎮' },
  16: { label: 'Epic Games',   icon: '🎯' },
  17: { label: 'GOG',          icon: '🦅' },
  15: { label: 'Itch.io',      icon: '🕹️' },
  10: { label: 'App Store',    icon: '🍎' },
  11: { label: 'iPad',         icon: '📱' },
  12: { label: 'Google Play',  icon: '🤖' },
}

// Solo mostramos las tiendas/web oficial, no redes sociales
const STORE_CATEGORY_IDS = new Set([1, 10, 11, 12, 13, 15, 16, 17])

const GAME_MODE_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  'Single player':                      { label: 'Un jugador',        icon: <UserIcon    className="w-3.5 h-3.5" /> },
  'Multiplayer':                        { label: 'Multijugador',      icon: <UsersIcon   className="w-3.5 h-3.5" /> },
  'Co-operative':                       { label: 'Cooperativo',       icon: <UsersIcon   className="w-3.5 h-3.5" /> },
  'Split screen':                       { label: 'Pantalla dividida', icon: <MonitorIcon className="w-3.5 h-3.5" /> },
  'Massively Multiplayer Online (MMO)': { label: 'MMO',               icon: <UsersIcon   className="w-3.5 h-3.5" /> },
  'Battle Royale':                      { label: 'Battle Royale',     icon: <TrophyIcon  className="w-3.5 h-3.5" /> },
}

// ── Props ──
interface Props {
  igdbId:        number
  gameSlug:      string
  enrichedData?: EnrichedData
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
        <div className="h-3 w-24 bg-gn-subtle/40 rounded animate-pulse mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-gn-subtle/30 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-gn-subtle/20 rounded-lg animate-pulse" />)}
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
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-video bg-gn-subtle/20 rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  )
}

// ── Helper: agrupar idiomas por tipo (Audio, Subtitles, Interface) ──
// IGDB usa nombres como "Spanish; Castilian" — normalizamos a label corto
function translateLanguageName(name: string): string {
  if (name.startsWith('Spanish'))   return 'Español'
  if (name.startsWith('English'))   return 'Inglés'
  if (name.startsWith('French'))    return 'Francés'
  if (name.startsWith('German'))    return 'Alemán'
  if (name.startsWith('Italian'))   return 'Italiano'
  if (name.startsWith('Portuguese')) return 'Portugués'
  if (name.startsWith('Japanese'))  return 'Japonés'
  if (name.startsWith('Chinese'))   return 'Chino'
  if (name.startsWith('Korean'))    return 'Coreano'
  if (name.startsWith('Russian'))   return 'Ruso'
  if (name.startsWith('Arabic'))    return 'Árabe'
  if (name.startsWith('Polish'))    return 'Polaco'
  if (name.startsWith('Dutch'))     return 'Holandés'
  if (name.startsWith('Turkish'))   return 'Turco'
  return name
}

function groupByType(supports: LanguageSupportEntry[]): Record<string, string[]> {
  const map: Record<string, Set<string>> = {}
  for (const s of supports) {
    if (!map[s.type]) map[s.type] = new Set()
    map[s.type].add(translateLanguageName(s.language))
  }
  // Ordenar cada lista: español primero, luego inglés, luego alfabético
  const result: Record<string, string[]> = {}
  for (const [type, langs] of Object.entries(map)) {
    result[type] = [...langs].sort((a, b) => {
      if (a === 'Español') return -1
      if (b === 'Español') return 1
      if (a === 'Inglés') return -1
      if (b === 'Inglés') return 1
      return a.localeCompare(b)
    })
  }
  return result
}

export default function IGDBGameDetails({ igdbId, gameSlug, enrichedData }: Props) {
  const [data,           setData]           = useState<IGDBGame | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [localSlugs,     setLocalSlugs]     = useState<Record<number, string>>({})
  const [showMoreDetails, setShowMoreDetails] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch(`/api/igdb/game/${igdbId}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [igdbId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') fetchData()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [fetchData])

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
  const hasDetails  = data.game_modes?.length || developer || publisher || franchise

  // Datos enriquecidos
  const perspectives   = enrichedData?.playerPerspectives ?? []
  const multiplayer    = enrichedData?.multiplayerInfo ?? null
  const ageRatings     = enrichedData?.ageRatings ?? null
  const languages      = enrichedData?.languageSupports ?? null
  const engine         = enrichedData?.gameEngine ?? null
  const videoIds       = enrichedData?.youtubeVideoIds ?? []
  const websites       = enrichedData?.websites ?? null

  const storeWebsites = websites?.filter(w => STORE_CATEGORY_IDS.has(w.category)) ?? []
  const hasMoreDetails = perspectives.length > 0 || multiplayer || ageRatings || languages || engine

  // PEGI tiene prioridad para España, fallback a ESRB
  const pegiRating = ageRatings?.find(ar => ar.category === 2)
  const esrbRating = ageRatings?.find(ar => ar.category === 1)

  // Idiomas agrupados por tipo (Doblaje / Subtítulos / Interfaz)
  const langByType = languages ? groupByType(languages) : null
  const dubLanguages      = langByType?.['Audio'] ?? []
  const subtitleLanguages = langByType?.['Subtitles'] ?? []
  const hasLanguageInfo   = dubLanguages.length > 0 || subtitleLanguages.length > 0

  return (
    <div className="space-y-4">

      {/* ── Detalles ── */}
      {(hasDetails || hasMoreDetails) && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-5">
            // Detalles
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {data.game_modes && data.game_modes.length > 0 && (
              <div>
                <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5">
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
            <div className="space-y-3">
              {developer && (
                <div>
                  <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-1">
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
                  <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-1">
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

          {franchise && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2">
                Saga / Franquicia
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1.5
                               bg-gn-accent/10 border border-gn-accent/20
                               text-purple-300 text-xs font-semibold uppercase tracking-wide rounded-lg">
                🎮 {franchise}
              </span>
            </div>
          )}

          {/* ── Más detalles (expandible) ── */}
          {hasMoreDetails && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center gap-2 text-gn-muted hover:text-gn-text
                           text-xs font-semibold uppercase tracking-widest transition-colors
                           cursor-pointer w-full"
              >
                {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Más detalles
              </button>

              {showMoreDetails && (
                <div className="mt-5 grid sm:grid-cols-2 gap-6">

                  {/* Perspectiva */}
                  {perspectives.length > 0 && (
                    <div>
                      <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Perspectiva
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {perspectives.map(p => (
                          <span
                            key={p}
                            className="px-2.5 py-1.5 bg-gn-surface border border-white/[0.06]
                                       rounded-lg text-gn-text text-xs font-semibold"
                          >
                            {translatePerspective(p)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motor gráfico */}
                  {engine && (
                    <div>
                      <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        Motor gráfico
                      </p>
                      <span className="px-2.5 py-1.5 bg-gn-surface border border-white/[0.06]
                                       rounded-lg text-gn-text text-xs font-semibold inline-block">
                        {engine}
                      </span>
                    </div>
                  )}

                  {/* Clasificación por edad */}
                  {(pegiRating || esrbRating) && (
                    <div>
                      <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Clasificación por edad
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pegiRating && (
                          <span className="px-2.5 py-1.5 bg-gn-surface border border-white/[0.06]
                                           rounded-lg text-gn-text text-xs font-semibold">
                            {PEGI_LABELS[pegiRating.rating] ?? `PEGI ${pegiRating.rating}`}
                          </span>
                        )}
                        {esrbRating && (
                          <span className="px-2.5 py-1.5 bg-gn-surface border border-white/[0.06]
                                           rounded-lg text-gn-text text-xs font-semibold">
                            ESRB: {ESRB_LABELS[esrbRating.rating] ?? esrbRating.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Multijugador detallado */}
                  {multiplayer && multiplayer.length > 0 && (
                    <div>
                      <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        Multijugador
                      </p>
                      <div className="space-y-2">
                        {multiplayer.map((m, i) => {
                          const details: string[] = []
                          if (m.onlineMax > 0)     details.push(`Online: ${m.onlineMax} max`)
                          if (m.offlineMax > 0)    details.push(`Local: ${m.offlineMax} max`)
                          if (m.onlineCoop)        details.push(`Coop online${m.onlineCoopMax > 0 ? ` (${m.onlineCoopMax})` : ''}`)
                          if (m.offlineCoop)       details.push(`Coop local${m.offlineCoopMax > 0 ? ` (${m.offlineCoopMax})` : ''}`)
                          if (m.campaignCoop)      details.push('Coop campaña')
                          if (m.lanCoop)           details.push('LAN')
                          if (m.splitscreen)       details.push('Pantalla dividida')

                          if (details.length === 0) return null

                          return (
                            <div key={i} className="text-xs text-gn-text">
                              {m.platform && (
                                <span className="text-gn-muted font-semibold mr-2">{m.platform}:</span>
                              )}
                              <span>{details.join(' · ')}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Idiomas */}
                  {hasLanguageInfo && (
                    <div className="sm:col-span-2">
                      <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5" />
                        Idiomas
                      </p>
                      <div className="space-y-2">
                        {dubLanguages.length > 0 && (
                          <div className="flex items-start gap-3 px-4 py-2.5 bg-gn-surface border border-white/[0.06] rounded-lg text-xs">
                            <span className="text-gn-muted font-semibold uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0">
                              🔊 Doblaje
                            </span>
                            <span className="text-gn-text">
                              {dubLanguages.map((lang, i) => (
                                <span key={lang}>
                                  {i > 0 && ', '}
                                  <span className={lang === 'Español' ? 'text-gn-primary font-semibold' : ''}>
                                    {lang}
                                  </span>
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                        {subtitleLanguages.length > 0 && (
                          <div className="flex items-start gap-3 px-4 py-2.5 bg-gn-surface border border-white/[0.06] rounded-lg text-xs">
                            <span className="text-gn-muted font-semibold uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0">
                              💬 Subtítulos
                            </span>
                            <span className="text-gn-text">
                              {subtitleLanguages.map((lang, i) => (
                                <span key={lang}>
                                  {i > 0 && ', '}
                                  <span className={lang === 'Español' ? 'text-gn-primary font-semibold' : ''}>
                                    {lang}
                                  </span>
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Trailers ── */}
      {videoIds.length > 0 && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-4">
            // Trailers
          </p>
          <div className={`grid gap-3 ${videoIds.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {videoIds.slice(0, 4).map(id => (
              <YouTubeFacade key={id} videoId={id} />
            ))}
          </div>
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
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-4">
            // Juegos similares
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {similar.map(sg => {
              const coverUrl  = sg.cover?.url ?? null
              const localSlug = localSlugs[sg.id]
              const card = (
                <div className="group flex flex-col gap-2">
                  <div
                    className="aspect-[3/4] bg-gn-surface rounded-lg overflow-hidden
                               border border-white/[0.06] transition-all duration-200
                               group-hover:border-gn-primary/40 relative"
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={sg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 120px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold leading-tight line-clamp-2
                                text-gn-muted group-hover:text-gn-text transition-colors">
                    {sg.name}
                  </p>
                  {localSlug ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-green-400">
                      ✓ En GameNook
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide
                                     text-gn-primary/70 group-hover:text-gn-primary transition-colors">
                      + Añadir
                    </span>
                  )}
                </div>
              )

              return localSlug ? (
                <Link key={sg.id} href={`/games/${localSlug}`}>{card}</Link>
              ) : (
                <Link key={sg.id} href={`/games/add?igdbId=${sg.id}`} title={`Añadir "${sg.name}" a GameNook`}>
                  {card}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Dónde comprarlo ── */}
      {storeWebsites.length > 0 && (
        <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="inline-flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              // Dónde comprarlo
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {storeWebsites.map((w, i) => {
              const store = STORE_CATEGORIES[w.category]
              if (!store) return null
              return (
                <a
                  key={i}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5
                             bg-gn-surface border border-white/[0.06] rounded-lg
                             text-gn-text text-sm font-semibold
                             hover:border-gn-primary/30 hover:bg-gn-primary/5
                             transition-all duration-200 group"
                >
                  <span className="text-base">{store.icon}</span>
                  {store.label}
                  <ExternalLink className="w-3.5 h-3.5 text-gn-muted group-hover:text-gn-primary transition-colors" />
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}