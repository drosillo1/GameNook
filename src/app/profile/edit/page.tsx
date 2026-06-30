// src/app/profile/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { toast } from '@/lib/toast'
import { FAVORITE_PLATFORMS, MAX_FAVORITE_PLATFORMS } from '@/lib/platforms'
import { AVATARS, getAvatarUrl } from '@/lib/avatars'

const BIO_MAX_LENGTH = 160
const LOCATION_MAX_LENGTH = 50

export default function EditProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name,              setName]              = useState('')
  const [bio,               setBio]               = useState('')
  const [location,          setLocation]          = useState('')
  const [favoritePlatforms, setFavoritePlatforms] = useState<string[]>([])
  const [avatar,            setAvatar]            = useState<string | null>(null)
  const [isLoaded,          setIsLoaded]          = useState(false)
  const [isSubmitting,      setIsSubmitting]      = useState(false)
  const [error,             setError]             = useState('')

  // Cargar los datos actuales del usuario (la sesión no trae bio/location/favoritePlatforms/avatar,
  // así que se pide directamente al endpoint de perfil)
  useEffect(() => {
    if (status !== 'authenticated') return

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        setName(data.name ?? '')
        setBio(data.bio ?? '')
        setLocation(data.location ?? '')
        setFavoritePlatforms(data.favoritePlatforms ?? [])
        setAvatar(data.avatar ?? null)
        setIsLoaded(true)
      })
      .catch(() => {
        setError('No se pudieron cargar tus datos actuales.')
        setIsLoaded(true)
      })
  }, [status])

  const togglePlatform = (platform: string) => {
    setFavoritePlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform)
      }
      if (prev.length >= MAX_FAVORITE_PLATFORMS) {
        return prev
      }
      return [...prev, platform]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (bio.length > BIO_MAX_LENGTH) {
      setError(`La bio no puede superar los ${BIO_MAX_LENGTH} caracteres`)
      return
    }
    if (location.length > LOCATION_MAX_LENGTH) {
      setError(`La ubicación no puede superar los ${LOCATION_MAX_LENGTH} caracteres`)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/user/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              name.trim(),
          bio:               bio.trim() || null,
          location:          location.trim() || null,
          favoritePlatforms,
          avatar,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar los cambios')
      }

      // Refresca la sesión en cliente para que Navigation/el resto de la UI
      // reflejen el nuevo name de inmediato
      await update({ name: name.trim() })

      toast.success('Perfil actualizado correctamente')
      router.push(`/profile/${session?.user?.username}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || !isLoaded) {
    return (
      <div className="min-h-screen bg-gn-bg flex items-center justify-center">
        <p className="text-gn-muted text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link
          href={session?.user?.username ? `/profile/${session.user.username}` : '/profile'}
          className="inline-flex items-center gap-1.5 text-gn-muted hover:text-gn-text
                     text-xs uppercase tracking-widest font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver al perfil
        </Link>

        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8">
          <p className="text-gn-primary text-xs font-bold uppercase tracking-widest mb-1">
            // Editar perfil
          </p>
          <h1 className="font-display font-black text-2xl text-gn-text mb-6">
            Personaliza tu perfil
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                              px-3 py-2.5 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Avatar */}
            <div>
              <label className="block text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-3">
                Avatar
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
                {/* Opción: por defecto (foto de Google o gradiente) */}
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  title="Por defecto"
                  className={`relative aspect-square rounded-full overflow-hidden border-2
                              transition-all
                              ${avatar === null
                                ? 'border-gn-primary ring-2 ring-gn-primary/30 scale-105'
                                : 'border-white/[0.06] hover:border-white/20 opacity-70 hover:opacity-100'}`}
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Por defecto"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white
                                 font-display font-black text-lg"
                      style={{ background: 'linear-gradient(135deg, #07070f, #e63946)' }}
                    >
                      {(name?.[0] ?? '?').toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Los 20 avatares */}
                {AVATARS.map(a => {
                  const isSelected = avatar === a.id
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvatar(a.id)}
                      title={a.label}
                      className={`relative aspect-square rounded-full overflow-hidden border-2
                                  transition-all
                                  ${isSelected
                                    ? 'border-gn-primary ring-2 ring-gn-primary/30 scale-105'
                                    : 'border-white/[0.06] hover:border-white/20 opacity-70 hover:opacity-100'}`}
                    >
                      <Image
                        src={getAvatarUrl(a.id)}
                        alt={a.label}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </button>
                  )
                })}
              </div>
              <p className="text-gn-primary text-xs font-semibold mt-2">
                {avatar ? AVATARS.find(a => a.id === avatar)?.label : 'Por defecto'}
              </p>
            </div>

            {/* Nombre visible */}
            <div>
              <label className="block text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1.5">
                Nombre visible para el resto de usuarios
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: DarkHunter99"
                maxLength={32}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                           px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-muted
                           focus:outline-none focus:border-gn-primary/40
                           focus:ring-1 focus:ring-gn-primary/20 transition-all"
              />
              <p className="text-gn-subtle text-xs mt-1 text-right">
                {name.length}/32
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Cuéntale al resto de la comunidad qué tipo de jugador eres..."
                rows={3}
                maxLength={BIO_MAX_LENGTH}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                           px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-muted
                           focus:outline-none focus:border-gn-primary/40
                           focus:ring-1 focus:ring-gn-primary/20 resize-none transition-all"
              />
              <p className="text-gn-subtle text-xs mt-1 text-right">
                {bio.length}/{BIO_MAX_LENGTH}
              </p>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Murcia, España"
                maxLength={LOCATION_MAX_LENGTH}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                           px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-muted
                           focus:outline-none focus:border-gn-primary/40
                           focus:ring-1 focus:ring-gn-primary/20 transition-all"
              />
            </div>

            {/* Plataformas favoritas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gn-muted text-xs font-semibold uppercase
                                   tracking-widest">
                  Plataformas favoritas
                </label>
                <span className="text-gn-subtle text-xs">
                  {favoritePlatforms.length}/{MAX_FAVORITE_PLATFORMS}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FAVORITE_PLATFORMS.map(platform => {
                  const isSelected = favoritePlatforms.includes(platform)
                  const isDisabled = !isSelected && favoritePlatforms.length >= MAX_FAVORITE_PLATFORMS

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold
                                  transition-all
                                  ${isSelected
                                    ? 'bg-gn-primary/15 border-gn-primary/40 text-gn-primary'
                                    : 'bg-white/[0.03] border-white/[0.06] text-gn-muted hover:border-white/15 hover:text-gn-text'}
                                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {platform}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gn-primary hover:bg-gn-primary-dark disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-bold uppercase
                         tracking-wider text-sm py-3 rounded-lg shadow-gn-red
                         transition-all duration-200"
            >
              {isSubmitting ? '⏳ Guardando...' : '▶ Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}