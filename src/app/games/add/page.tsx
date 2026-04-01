'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ChevronLeft, LockIcon, LoaderIcon } from 'lucide-react'
import IGDBSearch from '@/components/IGDBSearch'
import { IGDBGame } from '@/lib/igdb'
import { translateToSpanish } from '@/lib/translate'
import { toast } from '@/lib/toast'

// ── Helpers UI ─────────────────────────────────────────────────
const inputLocked =
  'w-full bg-white/[0.02] border border-white/[0.04] rounded-lg px-3.5 py-2.5 ' +
  'text-gn-muted text-sm cursor-not-allowed select-none'

const inputEditable =
  'w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3.5 py-2.5 ' +
  'text-gn-text text-sm placeholder-gn-muted outline-none ' +
  'focus:border-gn-primary/40 focus:ring-1 focus:ring-gn-primary/20 transition-all'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-3">
      // {children}
    </p>
  )
}

function LockedField({ label, value, placeholder = '—' }: {
  label: string; value: string; placeholder?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-gn-muted text-xs
                         font-semibold uppercase tracking-widest mb-1.5">
        {label}
        <LockIcon className="w-3 h-3 opacity-30" />
      </label>
      <div className={inputLocked}>
        {value || <span className="opacity-30">{placeholder}</span>}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function AddGamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')
  const [igdbId, setIgdbId] = useState<number | null>(null)
  const [igdbSelected, setIgdbSelected] = useState(false)

  // Descripción original de IGDB (ya traducida) para detectar cambios
  const [originalDescription, setOriginalDescription] = useState('')
  const [description, setDescription] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    releaseDate: '',
    genre: [] as string[],
    platform: [] as string[],
  })

  // useEffect para el autocompletado desde URL
  useEffect(() => {
    const igdbIdParam = searchParams.get('igdbId')
    if (!igdbIdParam || isNaN(parseInt(igdbIdParam))) return

    const id = parseInt(igdbIdParam)
    setIsTranslating(true)

    fetch(`/api/igdb/prefill/${id}`)
      .then(r => r.json())
      .then(async (game) => {
        if (game.error) return

        const releaseDate = game.first_release_date
          ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
          : ''

        // La URL ya viene normalizada desde igdb.ts
        const coverUrl = game.cover?.url ?? ''

        const translated = game.summary
          ? await translateToSpanish(game.summary)
          : ''

        setIgdbId(game.id)
        setIgdbSelected(true)
        setOriginalDescription(translated)
        setDescription(translated)
        setFormData({
          title: game.name,
          imageUrl: coverUrl,
          releaseDate,
          genre: game.genres?.map((g: any) => g.name) ?? [],
          platform: game.platforms?.map((p: any) => p.name) ?? [],
        })
      })
      .catch(console.error)
      .finally(() => setIsTranslating(false))
  }, [searchParams]) // Se ejecuta al montar o si cambian los params

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gn-bg flex items-center justify-center">
        <div className="text-gn-muted text-sm font-semibold uppercase
                        tracking-widest animate-pulse">
          Cargando...
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'
  const descriptionModified = description.trim() !== originalDescription.trim()

  // ── Selección IGDB ──────────────────────────────────────────
  const handleIGDBSelect = async (game: IGDBGame) => {
    setIsTranslating(true)

    const releaseDate = game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
      : ''

    const coverUrl = game.cover?.url
      ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      : ''

    const translated = game.summary
      ? await translateToSpanish(game.summary)
      : ''

    setIgdbId(game.id)
    setIgdbSelected(true)
    setOriginalDescription(translated)
    setDescription(translated)
    setFormData({
      title: game.name,
      imageUrl: coverUrl,
      releaseDate,
      genre: game.genres?.map(g => g.name) ?? [],
      platform: game.platforms?.map(p => p.name) ?? [],
    })

    setIsTranslating(false)
    toast.success(`"${game.name}" importado correctamente`)
  }

  const handleClearIGDB = () => {
    setIgdbId(null)
    setIgdbSelected(false)
    setOriginalDescription('')
    setDescription('')
    setFormData({ title: '', imageUrl: '', releaseDate: '', genre: [], platform: [] })
    // Opcional: Limpiar el query param de la URL para evitar recargas accidentales
    router.replace('/games/add')
  }

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!igdbSelected || !igdbId) {
      setError('Debes seleccionar un juego desde IGDB')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description,
          igdbId,
          descriptionModified: !isAdmin && descriptionModified,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear el juego')
      }

      const game = await res.json()

      if (game.status === 'PENDING') {
        toast.info(`"${game.title}" enviado — pendiente de revisión por descripción modificada`)
      } else {
        toast.success(`"${game.title}" publicado correctamente`)
      }

      router.push(`/games/${game.slug}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-gn-muted hover:text-gn-text
                     text-xs uppercase tracking-widest font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a juegos
        </Link>

        <div className="mb-8">
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Nueva entrada
          </p>
          <h1 className="font-display font-black text-4xl text-gn-text">
            Agregar juego
          </h1>
          <p className="text-gn-muted text-sm mt-1">
            Los datos se importan automáticamente desde IGDB.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

            <div className="space-y-6">

              {error && (
                <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                                px-4 py-3 rounded-lg text-sm font-semibold">
                  {error}
                </div>
              )}

              {/* ── Buscador IGDB ── */}
              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
                <SectionLabel>Buscar en IGDB</SectionLabel>

                {isTranslating ? (
                  <div className="flex items-center gap-3 py-3">
                    <LoaderIcon className="w-4 h-4 text-gn-primary animate-spin flex-shrink-0" />
                    <p className="text-gn-muted text-sm">
                      Traduciendo descripción al español...
                    </p>
                  </div>
                ) : !igdbSelected ? (
                  <>
                    <p className="text-gn-muted text-xs mb-3 leading-relaxed">
                      Busca el juego para importar sus datos automáticamente.
                      Solo podrás editar la descripción si contiene algún error.
                    </p>
                    <IGDBSearch onSelect={handleIGDBSelect} />
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt={formData.title}
                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gn-text font-semibold text-sm truncate">
                        {formData.title}
                      </p>
                      <p className="text-green-400 text-xs mt-0.5">
                        ✓ Datos importados desde IGDB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearIGDB}
                      className="text-gn-muted hover:text-gn-primary text-xs uppercase
                                 tracking-wide transition-colors flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* ── Datos del juego — solo visibles tras seleccionar ── */}
              {igdbSelected && !isTranslating && (
                <>
                  {/* Campos bloqueados */}
                  <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionLabel>Información del juego</SectionLabel>
                      <span className="flex items-center gap-1 text-gn-subtle text-[11px]">
                        <LockIcon className="w-3 h-3" />
                        Datos de IGDB
                      </span>
                    </div>

                    <LockedField label="Título" value={formData.title} />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <LockedField
                        label="Fecha de lanzamiento"
                        value={formData.releaseDate
                          ? new Date(formData.releaseDate).toLocaleDateString('es-ES')
                          : ''}
                        placeholder="Sin fecha"
                      />
                      <LockedField
                        label="Portada"
                        value={formData.imageUrl ? '✓ Importada desde IGDB' : ''}
                        placeholder="Sin portada"
                      />
                    </div>

                    {/* Géneros — bloqueados como pills */}
                    <div>
                      <label className="flex items-center gap-1.5 text-gn-muted text-xs
                                         font-semibold uppercase tracking-widest mb-2">
                        Géneros
                        <LockIcon className="w-3 h-3 opacity-30" />
                      </label>
                      {formData.genre.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.genre.map(g => (
                            <span
                              key={g}
                              className="px-2.5 py-1 bg-gn-primary/8 border border-gn-primary/15
                                         text-red-300 text-xs font-semibold uppercase
                                         tracking-wide rounded"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gn-subtle text-xs">Sin géneros</span>
                      )}
                    </div>

                    {/* Plataformas — bloqueadas como pills */}
                    <div>
                      <label className="flex items-center gap-1.5 text-gn-muted text-xs
                                         font-semibold uppercase tracking-widest mb-2">
                        Plataformas
                        <LockIcon className="w-3 h-3 opacity-30" />
                      </label>
                      {formData.platform.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.platform.map(p => (
                            <span
                              key={p}
                              className="px-2.5 py-1 bg-gn-accent/8 border border-gn-accent/15
                                         text-purple-300 text-xs font-semibold uppercase
                                         tracking-wide rounded"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gn-subtle text-xs">Sin plataformas</span>
                      )}
                    </div>
                  </div>

                  {/* Descripción — único campo editable */}
                  <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-start justify-between mb-1.5">
                      <label className="text-gn-muted text-xs font-semibold
                                         uppercase tracking-widest">
                        Descripción
                      </label>
                      {/* Aviso si fue modificada */}
                      {descriptionModified && !isAdmin && (
                        <span className="flex items-center gap-1 text-yellow-400
                                          text-[11px] font-semibold">
                          ⚠ Modificada — requiere revisión
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={5}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Descripción del juego..."
                      className={`${inputEditable} resize-none`}
                    />

                    <p className="text-gn-subtle text-[11px] mt-1.5 leading-relaxed">
                      Puedes corregir errores de traducción o de IGDB.
                      {!isAdmin && descriptionModified && (
                        <span className="text-yellow-400/70 ml-1">
                          Al modificarla el juego quedará pendiente de revisión.
                        </span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="sticky top-20">
              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5">
                <SectionLabel>Vista previa</SectionLabel>

                <div className="aspect-video bg-gn-surface border border-white/[0.06]
                                rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gn-muted">
                      <span className="text-3xl">🎮</span>
                      {!igdbSelected && (
                        <span className="text-xs text-center px-4 leading-relaxed opacity-60">
                          Busca un juego para continuar
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Estado de publicación */}
                {igdbSelected && (
                  <div className={`px-3.5 py-3 rounded-lg border text-xs leading-relaxed mb-4
                                   transition-all duration-200
                                   ${!isAdmin && descriptionModified
                                     ? 'bg-yellow-500/8 border-yellow-500/20 text-yellow-400'
                                     : 'bg-green-500/8  border-green-500/20  text-green-400'
                                   }`}>
                    {isAdmin
                      ? '✓ Se publicará directamente.'
                      : descriptionModified
                        ? '⏳ Quedará pendiente por descripción modificada.'
                        : '✓ Se publicará directamente.'
                    }
                  </div>
                )}

                <div className="h-px bg-white/[0.06] mb-4" />

                <button
                  type="submit"
                  disabled={isSubmitting || !igdbSelected || isTranslating}
                  className="w-full bg-gn-primary hover:bg-gn-primary-dark
                             disabled:opacity-40 disabled:cursor-not-allowed
                             text-white font-bold uppercase tracking-wider text-sm
                             px-5 py-3 rounded-lg shadow-gn-red
                             hover:-translate-y-0.5 transition-all duration-200 mb-2"
                >
                  {isSubmitting   ? '⏳ Publicando...'      :
                   isTranslating  ? '⏳ Traduciendo...'     :
                   !igdbSelected  ? 'Selecciona un juego'    :
                                    '▶ Publicar juego'}
                </button>

                <Link
                  href="/games"
                  className="flex items-center justify-center w-full border
                             border-white/[0.06] hover:border-gn-muted text-gn-muted
                             hover:text-gn-text font-semibold uppercase tracking-wider
                             text-xs py-2.5 rounded-lg transition-all duration-150"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}