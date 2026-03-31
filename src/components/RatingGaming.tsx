'use client'

import { useState } from 'react'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'

interface RatingGamingProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
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

// Sistema de 5 niveles (grupos de 2)
const RATING_META = {
  1:  { label: 'Jugable',        color: '#6b7280', chipClass: 'bg-gray-500/10  border-gray-500/30  text-gray-400'   },
  2:  { label: 'Jugable',        color: '#6b7280', chipClass: 'bg-gray-500/10  border-gray-500/30  text-gray-400'   },
  3:  { label: 'Entretenido',    color: '#3b82f6', chipClass: 'bg-blue-500/10  border-blue-500/30  text-blue-400'   },
  4:  { label: 'Entretenido',    color: '#3b82f6', chipClass: 'bg-blue-500/10  border-blue-500/30  text-blue-400'   },
  5:  { label: 'Recomendado',    color: '#a855f7', chipClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  6:  { label: 'Recomendado',    color: '#a855f7', chipClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  7:  { label: 'Muy Bueno',      color: '#06b6d4', chipClass: 'bg-cyan-500/10   border-cyan-500/30   text-cyan-400'    },
  8:  { label: 'Muy Bueno',      color: '#06b6d4', chipClass: 'bg-cyan-500/10   border-cyan-500/30   text-cyan-400'    },
  9:  { label: 'Imprescindible', color: '#f97316', chipClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
  10: { label: 'Obra Maestra',   color: '#fbbf24', chipClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
} as const

export default function RatingGaming({ value, onChange, disabled = false }: RatingGamingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const display = hovered ?? value
  const meta    = RATING_META[display as keyof typeof RATING_META] ?? RATING_META[5]
  const iconData = IconIcons[display as keyof typeof IconIcons]

  return (
    <div className="space-y-5">

      {/* ── Display central ── */}
      <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 ${meta.chipClass}`}>
        <PxlKitIcon icon={iconData} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-display font-black text-4xl leading-none"
              style={{ color: meta.color, fontFamily: 'Orbitron, monospace' }}
            >
              {display}
            </span>
            <span className="text-gn-muted text-sm">/10</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest mt-0.5"
             style={{ color: meta.color }}>
            {meta.label}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-24 flex flex-col gap-1">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(display / 10) * 100}%`,
                background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
              }}
            />
          </div>
          {/* Dots de nivel */}
          <div className="flex justify-between px-0.5">
            {[1, 2, 3, 4, 5].map(lvl => (
              <div
                key={lvl}
                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background: Math.ceil(display / 2) >= lvl ? meta.color : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid 5×2 ── */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => {
          const m         = RATING_META[rating as keyof typeof RATING_META]
          const iconData  = IconIcons[rating as keyof typeof IconIcons]
          const isActive  = rating <= (hovered ?? value)
          const isExact   = rating === value

          return (
            <button
              key={rating}
              type="button"
              onClick={() => !disabled && onChange(rating)}
              onMouseEnter={() => !disabled && setHovered(rating)}
              onMouseLeave={() => setHovered(null)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center gap-1
                py-2.5 rounded-lg border transition-all duration-150
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}
                ${isActive
                  ? `${m.chipClass} shadow-sm`
                  : 'bg-white/[0.02] border-white/[0.06] text-gn-muted hover:border-white/15'
                }
                ${isExact && !hovered ? 'ring-1 ring-offset-1 ring-offset-gn-card' : ''}
              `}
              style={isExact && !hovered ? { ringColor: m.color } : {}}
            >
              <PxlKitIcon icon={iconData} size={24} />
              <span
                className="font-display font-bold text-xs leading-none"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  color: isActive ? m.color : undefined,
                }}
              >
                {rating}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}