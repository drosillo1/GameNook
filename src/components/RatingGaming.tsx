// components/RatingGaming.tsx
"use client"

import { useState } from 'react'
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
  Crown 
} from 'lucide-react'

interface RatingGamingProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function RatingGaming({ value, onChange, disabled = false }: RatingGamingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  
  const displayValue = hoveredValue ?? value
  
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

  return (
    <div className="space-y-6">
      {/* Display central con icono */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentConfig.bg} flex items-center justify-center ${currentConfig.color}`}>
            <IconComponent className="w-10 h-10" />
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

      {/* Grid de selección con iconos individuales */}
      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
          const isSelected = rating <= value
          const isHovered = hoveredValue !== null && rating <= hoveredValue
          const config = getRatingConfig(rating)
          const IconComp = config.icon
          
          return (
            <button
              key={rating}
              onClick={() => !disabled && onChange(rating)}
              onMouseEnter={() => !disabled && setHoveredValue(rating)}
              onMouseLeave={() => setHoveredValue(null)}
              disabled={disabled}
              title={`${rating}/10 - ${config.text}`}
              className={`
                relative w-12 h-12 rounded-full transition-all duration-200 transform
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                  : 'cursor-pointer hover:scale-110'
                }
                ${isSelected || isHovered
                  ? `${config.color} bg-gradient-to-br ${config.bg} shadow-lg scale-105 ring-2 ring-offset-1 ring-gray-300`
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
  )
}