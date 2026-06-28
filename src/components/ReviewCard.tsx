// src/components/ReviewCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EditIcon, TrashIcon, MoreVerticalIcon, HeartIcon } from 'lucide-react'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'
import { toast } from '@/lib/toast'
import { getRatingData, getRatingChipClass } from '@/lib/rating'
import { toggleReviewLikeAction } from '@/actions/reviews'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  updatedAt: string
  likeCount: number
  likedByCurrentUser: boolean
  user: {
    id: string
    name: string | null
    username: string | null
    displayName: string
    image: string | null
  }
}

interface ReviewCardProps {
  review: Review
  currentUserId?: string
  isOwn?: boolean
}

const ICON_MAP = { Sword, Heart, Shield, Medal, Trophy, Crown } as const

const RATING_META = {
  1:  { label: 'Jugable',        color: '#6b7280' },
  2:  { label: 'Jugable',        color: '#6b7280' },
  3:  { label: 'Entretenido',    color: '#3b82f6' },
  4:  { label: 'Entretenido',    color: '#3b82f6' },
  5:  { label: 'Recomendado',    color: '#a855f7' },
  6:  { label: 'Recomendado',    color: '#a855f7' },
  7:  { label: 'Muy Bueno',      color: '#06b6d4' },
  8:  { label: 'Muy Bueno',      color: '#06b6d4' },
  9:  { label: 'Imprescindible', color: '#f97316' },
  10: { label: 'Obra Maestra',   color: '#fbbf24' },
} as const

function RatingDisplay({ rating }: { rating: number }) {
  const { iconName, label } = getRatingData(rating)
  const icon = ICON_MAP[iconName as keyof typeof ICON_MAP]

  return (
    <div className="flex items-center gap-2">
      <PxlKitIcon icon={icon} size={16} />
      <span className="font-medium text-sm text-gn-text">{rating}/10</span>
      <span className="text-xs text-gn-muted">{label}</span>
    </div>
  )
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now  = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60)      return 'hace un momento'
  if (diffInSeconds < 3600)    return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400)   return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`

  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

function ExpandableContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > 300

  return (
    <div className="mb-3">
      <p className={`text-gn-text leading-relaxed whitespace-pre-line break-words text-sm
                     ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
        {content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-gn-primary hover:text-gn-primary-dark text-xs
                     font-semibold mt-1.5 transition-colors"
        >
          {expanded ? 'Ver menos ▲' : 'Ver más ▼'}
        </button>
      )}
    </div>
  )
}

export default function ReviewCard({ review, currentUserId, isOwn: isOwnProp }: ReviewCardProps) {
  const isOwn  = isOwnProp ?? (currentUserId !== undefined && currentUserId === review.user.id)
  const router = useRouter()

  const [showMenu,     setShowMenu]     = useState(false)
  const [isEditing,    setIsEditing]    = useState(false)
  const [isDeleting,   setIsDeleting]   = useState(false)
  const [editContent,  setEditContent]  = useState(review.content || '')
  const [editRating,   setEditRating]   = useState(review.rating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [error,        setError]        = useState('')

  // Estado optimista del like
  const [liked,      setLiked]      = useState(review.likedByCurrentUser)
  const [likeCount,  setLikeCount]  = useState(review.likeCount)
  const [isLiking,   setIsLiking]   = useState(false)

  const handleToggleLike = async () => {
    if (isOwn || isLiking) return

    // Actualización optimista
    const prevLiked = liked
    const prevCount = likeCount
    setLiked(!prevLiked)
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1)
    setIsLiking(true)

    try {
      const result = await toggleReviewLikeAction(review.id)
      setLiked(result.liked)
      setLikeCount(result.likeCount)
    } catch (error) {
      // Revertir si falla
      setLiked(prevLiked)
      setLikeCount(prevCount)
      toast.error(error instanceof Error ? error.message : 'No se pudo registrar el voto')
    } finally {
      setIsLiking(false)
    }
  }

  const handleEdit = async () => {
    if (editRating === 0) {
      setError('Por favor selecciona una puntuación')
      return
    }
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rating: editRating, content: editContent.trim() || null }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la reseña')
      }
      setIsEditing(false)
      setError('')
      toast.success('Reseña actualizada correctamente')
      setTimeout(() => router.refresh(), 200)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la reseña')
      }
      toast.success('Reseña eliminada correctamente')
      setTimeout(() => router.refresh(), 200)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la reseña')
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setIsDeleting(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditContent(review.content || '')
    setEditRating(review.rating)
    setError('')
  }

  return (
    <div className="border border-white/[0.06] rounded-xl px-5 py-4 bg-gn-card">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400
                        px-3 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {review.user.username ? (
            <Link href={`/profile/${review.user.username}`} className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gn-card border border-white/[0.06]
                              flex items-center justify-center overflow-hidden
                              hover:ring-2 hover:ring-gn-primary/30 transition-all">
                {review.user.image ? (
                  <img
                    src={review.user.image}
                    alt={review.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gn-muted text-lg font-semibold">
                    {review.user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gn-card border border-white/[0.06]
                            flex items-center justify-center overflow-hidden flex-shrink-0">
              {review.user.image ? (
                <img
                  src={review.user.image}
                  alt={review.user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gn-muted text-lg font-semibold">
                  {review.user.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gn-text text-sm">
              {review.user.username ? (
                <Link
                  href={`/profile/${review.user.username}`}
                  className="hover:text-gn-primary transition-colors"
                >
                  {review.user.displayName}
                </Link>
              ) : (
                review.user.displayName
              )}
              {isOwn && <span className="text-xs text-gn-primary ml-2">(Tú)</span>}
            </h4>
            <p className="text-xs text-gn-muted">
              {formatRelativeTime(review.createdAt)}
              {review.createdAt !== review.updatedAt && (
                <span className="ml-1">(editado)</span>
              )}
            </p>
          </div>
        </div>

        {isOwn && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gn-muted hover:text-gn-text rounded transition-colors"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-gn-card border
                              border-white/[0.06] rounded-lg shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => { setIsEditing(true); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-gn-text
                             hover:bg-white/5 flex items-center transition-colors"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => { setShowMenu(false); handleDelete() }}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-400
                             hover:bg-red-500/10 flex items-center transition-colors
                             disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Puntuación */}
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gn-text mb-2">
            Puntuación
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => {
              const { iconName, color } = getRatingData(rating)
              const chipClass           = getRatingChipClass(rating)
              const icon                = ICON_MAP[iconName as keyof typeof ICON_MAP]
              const isActive            = rating <= editRating
              const isExact             = rating === editRating

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setEditRating(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`flex flex-col items-center justify-center gap-1 py-2
                              rounded-lg border transition-all
                              ${isActive ? chipClass : 'bg-white/5 border-white/10 text-gn-muted hover:border-white/15'}
                              ${isExact ? 'ring-1 ring-offset-1 ring-offset-gn-card ring-[var(--ring-color)]' : ''}`}
                  style={isExact ? { ['--ring-color' as any]: color } : {}}
                >
                  <PxlKitIcon icon={icon} size={18} />
                  <span className="text-xs font-bold">{rating}</span>
                </button>
              )
            })}
          </div>
          {editRating > 0 && (
            <p className="mt-2 text-xs text-gn-muted">
              {editRating}/10 — {getRatingData(editRating).label}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <RatingDisplay rating={review.rating} />
        </div>
      )}

      {/* Contenido */}
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gn-text mb-2">
            Comentario
          </label>
          <textarea
            rows={3}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="Comparte tu opinión sobre el juego..."
            className="w-full px-3 py-2 border border-white/[0.06] rounded-lg bg-white/5
                       text-gn-text placeholder-gn-muted/50 focus:ring-2
                       focus:ring-gn-primary/50 focus:border-gn-primary/50
                       resize-none transition-colors"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gn-muted">Máximo 1000 caracteres</span>
            <span className="text-xs text-gn-muted">{editContent.length}/1000</span>
          </div>
        </div>
      ) : (
        review.content && <ExpandableContent content={review.content} />
      )}

      {isEditing && (
        <div className="flex justify-end gap-2">
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-sm text-gn-muted border border-white/[0.06]
                       rounded-lg hover:text-gn-text hover:border-white/15 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            disabled={editRating === 0}
            className="px-4 py-2 text-sm bg-gn-primary text-white rounded-lg
                       hover:bg-gn-primary-dark disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Guardar Cambios
          </button>
        </div>
      )}

      {/* Footer: botón de like */}
      {!isEditing && (
        <div className="flex items-center justify-end mt-1 pt-3 border-t border-white/[0.04]">
          <button
            onClick={handleToggleLike}
            disabled={isOwn || isLiking}
            title={isOwn ? 'No puedes votar tu propia reseña' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs
                        font-semibold transition-all
                        ${liked
                          ? 'bg-gn-primary/10 border-gn-primary/30 text-gn-primary'
                          : 'bg-white/5 border-white/10 text-gn-muted hover:border-white/20 hover:text-gn-text'}
                        ${isOwn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        ${isLiking ? 'opacity-60' : ''}`}
          >
            <HeartIcon
              className="w-3.5 h-3.5"
              fill={liked ? 'currentColor' : 'none'}
            />
            {likeCount}
          </button>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </div>
  )
}