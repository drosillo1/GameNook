// src/components/ReviewCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarIcon, EditIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react'

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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 font-medium text-sm">
        {rating}/10
      </span>
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
    <div className={`border border-gray-200 rounded-lg p-4 ${isOwn ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {review.user.avatar ? (
              <img 
                src={review.user.avatar} 
                alt={review.user.name || review.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg">
                {(review.user.name || review.user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Información del usuario */}
          <div>
            <h4 className="font-medium text-gray-900">
              {review.user.name || review.user.username}
              {isOwn && <span className="text-sm text-indigo-600 ml-2">(Tú)</span>}
            </h4>
            <p className="text-sm text-gray-500">
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
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
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
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puntuación
          </label>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 10 }).map((_, index) => {
              const starValue = index + 1
              const isActive = starValue <= (hoveredRating || editRating)
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setEditRating(starValue)}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`p-1 rounded transition-colors ${
                    isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <StarIcon 
                    className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`}
                  />
                </button>
              )
            })}
            {(hoveredRating || editRating) > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-700">
                {hoveredRating || editRating}/10
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <RatingStars rating={review.rating} />
        </div>
      )}

      {/* Contenido de la reseña */}
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario
          </label>
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Comparte tu opinión sobre el juego..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Máximo 1000 caracteres</span>
            <span className="text-xs text-gray-400">{editContent.length}/1000</span>
          </div>
        </div>
      ) : (
        review.content && (
          <div className="mb-3">
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          </div>
        )
      )}

      {/* Botones de edición */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            disabled={editRating === 0}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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