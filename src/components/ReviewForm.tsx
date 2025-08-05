// src/components/ReviewForm.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gamepad2, Heart, Zap, Trophy, Crown, Send, Edit3 } from 'lucide-react'

interface ReviewFormProps {
  gameId: string
  existingReview?: {
    id: string
    rating: number
    content: string | null
  } | null
}

export default function ReviewForm({ gameId, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating || 5)
  const [content, setContent] = useState(existingReview?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const displayValue = hoveredValue ?? rating

  // Función para obtener el icono según la puntuación
  const getIcon = (rating: number) => {
    if (rating <= 2) return Gamepad2  // Básico
    if (rating <= 4) return Heart     // Okay
    if (rating <= 6) return Zap       // Bueno
    if (rating <= 8) return Trophy    // Muy bueno
    return Crown  // Excelente
  }

  const getRatingText = (rating: number) => {
    if (rating <= 2) return 'Jugable'
    if (rating <= 4) return 'Entretenido'
    if (rating <= 6) return 'Recomendado'
    if (rating <= 8) return 'Imprescindible'
    return 'Obra Maestra'
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-gray-500'
    if (rating <= 4) return 'text-blue-500'
    if (rating <= 6) return 'text-purple-500'
    if (rating <= 8) return 'text-orange-500'
    return 'text-yellow-500'
  }

  const getBackgroundColor = (rating: number) => {
    if (rating <= 2) return 'from-gray-100 to-gray-200'
    if (rating <= 4) return 'from-blue-100 to-blue-200'
    if (rating <= 6) return 'from-purple-100 to-purple-200'
    if (rating <= 8) return 'from-orange-100 to-orange-200'
    return 'from-yellow-100 to-yellow-200'
  }

  const IconComponent = getIcon(displayValue)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = existingReview 
        ? `/api/reviews/${existingReview.id}`
        : '/api/reviews'
      
      const method = existingReview ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          rating,
          content: content.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la reseña')
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar la reseña. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña?')) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/reviews/${existingReview.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la reseña')
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la reseña. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sistema de puntuación gaming */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Tu Puntuación
        </label>

        {/* Display central con icono */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBackgroundColor(displayValue)} flex items-center justify-center ${getRatingColor(displayValue)}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-gray-100">
              <span className="text-sm font-bold text-gray-700">{displayValue}</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-3">
            {getRatingText(displayValue)}
          </p>
          <p className="text-sm text-gray-500">
            {displayValue}/10
          </p>
        </div>

        {/* Grid de selección compacto */}
        <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((ratingValue) => {
            const isSelected = ratingValue <= rating
            const isHovered = hoveredValue !== null && ratingValue <= hoveredValue
            const IconComp = getIcon(ratingValue)

            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHoveredValue(ratingValue)}
                onMouseLeave={() => setHoveredValue(null)}
                disabled={isSubmitting}
                className={`
                  relative w-10 h-10 rounded-full transition-all duration-200 transform
                  ${isSubmitting 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'cursor-pointer hover:scale-110'
                  }
                  ${isSelected || isHovered
                    ? `${getRatingColor(ratingValue)} bg-gradient-to-br ${getBackgroundColor(ratingValue)} shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }
                `}
              >
                <IconComp className="w-5 h-5 mx-auto" />
                <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-white rounded-full w-4 h-4 flex items-center justify-center shadow border text-gray-700">
                  {ratingValue}
                </span>
              </button>
            )
          })}
        </div>

        {/* Barra de nivel estilo gaming */}
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>NIVEL</span>
            <span>{Math.ceil(displayValue / 2)}/5</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(displayValue / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`w-2 h-2 rounded-full ${
                  Math.ceil(displayValue / 2) >= level ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Campo de comentario */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Tu Reseña (Opcional)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          maxLength={1000}
          placeholder="Comparte tu experiencia con este juego..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {content.length}/1000 caracteres
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : existingReview ? (
            <>
              <Edit3 className="w-4 h-4" />
              Actualizar Reseña
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publicar Reseña
            </>
          )}
        </button>

        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors text-sm"
          >
            Eliminar Reseña
          </button>
        )}
      </div>
    </form>
  )
}