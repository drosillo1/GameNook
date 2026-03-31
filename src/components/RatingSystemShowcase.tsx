'use client'

import { RatingIcon } from './RatingIcon'

const RATING_LEVELS = [
  { range: '1-2',  iconName: 'Sword' as const,  label: 'Jugable',        color: 'text-gray-400   border-gray-500/30   bg-gray-500/10'   },
  { range: '3-4',  iconName: 'Heart' as const,  label: 'Entretenido',    color: 'text-blue-400   border-blue-500/30   bg-blue-500/10'   },
  { range: '5-6',  iconName: 'Shield' as const, label: 'Recomendado',    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { range: '7-8',  iconName: 'Medal' as const,  label: 'Muy Bueno',      color: 'text-cyan-400   border-cyan-500/30   bg-cyan-500/10'   },
  { range: '9',    iconName: 'Trophy' as const, label: 'Imprescindible', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { range: '10',   iconName: 'Crown' as const,  label: 'Obra Maestra',   color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
]

export function RatingSystemShowcase() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {RATING_LEVELS.map((r) => (
        <div
          key={r.range}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${r.color}`}
        >
          <span className="font-display font-bold text-base">{r.range}</span>
          <RatingIcon iconName={r.iconName} size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">{r.label}</span>
        </div>
      ))}
    </div>
  )
}
