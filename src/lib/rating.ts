// Funciones helper para obtener datos de ratings sin JSX
// Estas son "use server" compatible porque retornan datos primitivos

export function getRatingData(rating: number) {
  const data = {
    1:  { iconName: 'Sword',  label: 'Jugable',        color: '#6b7280',  tailwind: 'text-gray-400' },
    2:  { iconName: 'Sword',  label: 'Jugable',        color: '#6b7280',  tailwind: 'text-gray-400' },
    3:  { iconName: 'Heart',  label: 'Entretenido',    color: '#3b82f6',  tailwind: 'text-blue-400' },
    4:  { iconName: 'Heart',  label: 'Entretenido',    color: '#3b82f6',  tailwind: 'text-blue-400' },
    5:  { iconName: 'Shield', label: 'Recomendado',    color: '#a855f7',  tailwind: 'text-purple-400' },
    6:  { iconName: 'Shield', label: 'Recomendado',    color: '#a855f7',  tailwind: 'text-purple-400' },
    7:  { iconName: 'Medal',  label: 'Muy Bueno',      color: '#06b6d4',  tailwind: 'text-cyan-400' },
    8:  { iconName: 'Medal',  label: 'Muy Bueno',      color: '#06b6d4',  tailwind: 'text-cyan-400' },
    9:  { iconName: 'Trophy', label: 'Imprescindible', color: '#f97316',  tailwind: 'text-orange-400' },
    10: { iconName: 'Crown',  label: 'Obra Maestra',   color: '#fbbf24',  tailwind: 'text-yellow-400' },
  } as const

  return data[rating as keyof typeof data] || data[5]
}

export function getRatingBarColor(rating: number) {
  const data = {
    1:  '#6b7280',
    2:  '#6b7280',
    3:  '#3b82f6',
    4:  '#3b82f6',
    5:  '#a855f7',
    6:  '#a855f7',
    7:  '#06b6d4',
    8:  '#06b6d4',
    9:  '#f97316',
    10: '#fbbf24',
  } as const

  return data[rating as keyof typeof data] || '#a855f7'
}

export function getRatingChipClass(rating: number) {
  const data = {
    1:  'bg-gray-500/10 border-gray-500/30 text-gray-400',
    2:  'bg-gray-500/10 border-gray-500/30 text-gray-400',
    3:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
    4:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
    5:  'bg-purple-500/10 border-purple-500/30 text-purple-400',
    6:  'bg-purple-500/10 border-purple-500/30 text-purple-400',
    7:  'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    8:  'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    9:  'bg-orange-500/10 border-orange-500/30 text-orange-400',
    10: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  } as const

  return data[rating as keyof typeof data] || 'bg-purple-500/10 border-purple-500/30 text-purple-400'
}
