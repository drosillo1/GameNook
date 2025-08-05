// components/RatingGaming.tsx
"use client"

import { useState } from 'react'
import { Gamepad2, Heart, Zap, Trophy, Crown } from 'lucide-react'

interface RatingGamingProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function RatingGaming({ value, onChange, disabled = false }: RatingGamingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  
  const displayValue = hoveredValue ?? value
  
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

  const IconComponent = getIcon(displayValue)

  return (
    <div className="space-y-6">
      {/* Display central con icono */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${getRatingColor(displayValue)}`}>
            <IconComponent className="w-10 h-10" />
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

      {/* Grid de selección con iconos circulares */}
      <div className="grid grid-cols-5 gap-3 max-w-xs mx-auto">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
          const isSelected = rating <= value
          const isHovered = hoveredValue !== null && rating <= hoveredValue
          const IconComp = getIcon(rating)
          
          return (
            <button
              key={rating}
              onClick={() => !disabled && onChange(rating)}
              onMouseEnter={() => !disabled && setHoveredValue(rating)}
              onMouseLeave={() => setHoveredValue(null)}
              disabled={disabled}
              className={`
                relative w-12 h-12 rounded-full transition-all duration-200 transform
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                  : 'cursor-pointer hover:scale-110'
                }
                ${isSelected || isHovered
                  ? `${getRatingColor(rating)} bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }
              `}
            >
              <IconComp className="w-6 h-6 mx-auto" />
              <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow border">
                {rating}
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
  )
}