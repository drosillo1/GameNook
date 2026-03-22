// src/components/ReviewForm.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Skull, 
  AlertTriangle, 
  Frown, 
  HelpCircle, 
  ThumbsUp, 
  Smile, 
  Flame, 
  Star, 
  Trophy, 
  Crown,
  Send, 
  Edit3 
} from 'lucide-react'

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

  // Sistema individual para cada puntuación
  const getRatingConfig = (rating: number) => {
    const configs = {
      1: { icon: Skull, text: 'Desastre', color: 'text-red-600', bg: 'from-red-100 to-red-200' },
      2: { icon: AlertTriangle, text: 'Malo', color: 'text-red-500', bg: 'from-red-50 to-red-150' },
      3: { icon: Frown, text: 'Mediocre', color: 'text-orange-600', bg: 'from-orange-100 to-orange-200' },
      4: { icon: HelpCircle, text: 'Dudoso', color: 'text-orange-500', bg: 'from-orange-50 to-orange-150' },
      5: { icon: ThumbsUp, text: 'Decente', color: 'text-yellow-600', bg: 'from-yellow-100 to-yellow-200' },
      6: { icon: Smile, text: 'Bueno', color: 'text-lime-600', bg: 'from-lime-100 to-lime-200' },
      7: { icon: Flame, text: 'Genial', color: 'text-green-600', bg: 'from-green-100 to-green-200' },
      8: { icon: Star, text: 'Excelente', color: 'text-blue-600', bg: 'from-blue-100 to-blue-200' },
      9: { icon: Trophy, text: 'Imprescindible', color: 'text-purple-600', bg: 'from-purple-100 to-purple-200' },
      10: { icon: Crown, text: 'Obra Maestra', color: 'text-yellow-500', bg: 'from-yellow-200 to-amber-200' }
    }
    return configs[rating as keyof typeof configs] || configs[5]
  }

  const currentConfig = getRatingConfig(displayValue)
  const IconComponent = currentConfig.icon

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
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentConfig.bg} flex items-center justify-center ${currentConfig.color}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-gray-100">
              <span className="text-sm font-bold text-gray-700">{displayValue}</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-3">
            {currentConfig.text}
          </p>
          <p className="text-sm text-gray-500">
            {displayValue}/10
          </p>
        </div>

        {/* Grid de selección compacto */}
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((ratingValue) => {
            const isSelected = ratingValue <= rating
            const isHovered = hoveredValue !== null && ratingValue <= hoveredValue
            const config = getRatingConfig(ratingValue)
            const IconComp = config.icon

            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHoveredValue(ratingValue)}
                onMouseLeave={() => setHoveredValue(null)}
                disabled={isSubmitting}
                title={`${ratingValue}/10 - ${config.text}`}
                className={`
                  relative w-10 h-10 rounded-full transition-all duration-200 transform
                  ${isSubmitting 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'cursor-pointer hover:scale-110'
                  }
                  ${isSelected || isHovered
                    ? `${config.color} bg-gradient-to-br ${config.bg} shadow-lg scale-105 ring-2 ring-offset-1 ring-gray-300`
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
              className={`h-full rounded-full transition-all duration-500 ${
                displayValue <= 2 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                displayValue <= 4 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                displayValue <= 6 ? 'bg-gradient-to-r from-yellow-400 to-lime-500' :
                displayValue <= 8 ? 'bg-gradient-to-r from-green-400 to-blue-500' :
                'bg-gradient-to-r from-purple-500 to-yellow-500'
              }`}
              style={{ width: `${(displayValue / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`w-2 h-2 rounded-full ${
                  Math.ceil(displayValue / 2) >= level ? 
                    (displayValue >= 9 ? 'bg-yellow-500' : 
                     displayValue >= 7 ? 'bg-blue-500' : 
                     displayValue >= 5 ? 'bg-green-500' : 
                     displayValue >= 3 ? 'bg-orange-500' : 'bg-red-500') 
                  : 'bg-gray-300'
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