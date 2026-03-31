'use client'

import { RatingIcon } from './RatingIcon'

interface RatingLevel {
  label: string
  iconName: 'Crown' | 'Trophy' | 'Medal' | 'Shield' | 'Heart' | 'Sword'
  color: string
  count: number
}

export function RatingDistribution({ levels, total }: { levels: RatingLevel[]; total: number }) {
  return (
    <div className="space-y-2.5">
      {levels.map(l => (
        <div key={l.label} className="flex items-center gap-3">
          <RatingIcon iconName={l.iconName} size={20} />
          <span className="text-gn-muted text-xs w-28">{l.label}</span>
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: total > 0 ? `${(l.count / total) * 100}%` : '0%',
                background: l.color,
              }}
            />
          </div>
          <span className="text-gn-muted text-xs w-8 text-right">{l.count}</span>
        </div>
      ))}
    </div>
  )
}
