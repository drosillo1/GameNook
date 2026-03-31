// src/components/ReviewCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    username: string
    avatar: string | null
  }
}

interface ReviewCardProps {
  review: Review
  isOwn: boolean
}

const IconIcons = {
  1:  Sword,
  2:  Sword,
  3:  Heart,
  4:  Heart,
  5:  Shield,
  6:  Shield,
  7:  Medal,
  8:  Medal,
  9:  Trophy,
  10: Crown,
} as const

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
  const meta = RATING_META[rating as keyof typeof RATING_META]
  const iconData = IconIcons[rating as keyof typeof IconIcons]
  
  return (
    <div className="flex items-center gap-2">
      <PxlKitIcon icon={iconData} size={16} />
      <span className="font-medium text-sm text-gn-text">{rating}/10</span>
      <span className="text-xs text-gn-muted">{meta.label}</span>
    </div>
  )
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function ReviewCard({ review, isOwn }: ReviewCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editContent, setEditContent] = useState(review.content || '')
  const [editRating, setEditRating] = useState(review.rating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [error, setError] = useState('')

  const handleEdit = async () => {
    if (editRating === 0) {
      setError('Por favor selecciona una puntuación')
      return
    }

    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: editRating,
          content: editContent.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la reseña')
      }

      setIsEditing(false)
      setError('')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la reseña')
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
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
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gn-card border border-white/[0.06] flex items-center justify-center overflow-hidden">
            {review.user.avatar ? (
              <img 
                src={review.user.avatar} 
                alt={review.user.name || review.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gn-muted text-lg font-semibold">
                {(review.user.name || review.user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Información del usuario */}
          <div>
            <h4 className="font-semibold text-gn-text text-sm">
              {review.user.name || review.user.username}
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

        {/* Menú de opciones para reseñas propias */}
        {isOwn && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gn-muted hover:text-gn-text rounded transition-colors"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-gn-card border border-white/[0.06] rounded-lg shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gn-text hover:bg-white/5 flex items-center transition-colors"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors disabled:opacity-50"
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
            {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
              const meta = RATING_META[rating as keyof typeof RATING_META]
              const iconData = IconIcons[rating as keyof typeof IconIcons]
              const isActive = rating <= editRating
              const isExact = rating === editRating
              
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setEditRating(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-white/10 text-gn-muted hover:border-white/15'
                  } ${isExact ? 'ring-1 ring-offset-1 ring-offset-gn-card' : ''}`}
                  style={isExact ? { ringColor: meta.color } : {}}
                >
                  <PxlKitIcon icon={iconData} size={18} />
                  <span className="text-xs font-bold">{rating}</span>
                </button>
              )
            })}
          </div>
          {editRating > 0 && (
            <p className="mt-2 text-xs text-gn-muted">
              {editRating}/10 - {RATING_META[editRating as keyof typeof RATING_META].label}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <RatingDisplay rating={review.rating} />
        </div>
      )}

      {/* Contenido de la reseña */}
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gn-text mb-2">
            Comentario
          </label>
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Comparte tu opinión sobre el juego..."
            className="w-full px-3 py-2 border border-white/[0.06] rounded-lg bg-white/5 text-gn-text placeholder-gn-muted/50 focus:ring-2 focus:ring-gn-primary/50 focus:border-gn-primary/50 resize-none transition-colors"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gn-muted">Máximo 1000 caracteres</span>
            <span className="text-xs text-gn-muted">{editContent.length}/1000</span>
          </div>
        </div>
      ) : (
        review.content && (
          <div className="mb-3">
            <p className="text-gn-text leading-relaxed">{review.content}</p>
          </div>
        )
      )}

      {/* Botones de edición */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-sm text-gn-muted border border-white/[0.06] rounded-lg hover:text-gn-text hover:border-white/15 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            disabled={editRating === 0}
            className="px-4 py-2 text-sm bg-gn-primary text-white rounded-lg hover:bg-gn-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Guardar Cambios
          </button>
        </div>
      )}

      {/* Click outside para cerrar el menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}