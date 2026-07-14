// src/lib/upcoming.ts

// Valores de `status` en IGDB (campo Game.status)
// https://api-docs.igdb.com/#game-enums
export const IGDB_RELEASE_STATUS = {
  RELEASED:      0,
  ALPHA:         2,
  BETA:          3,
  EARLY_ACCESS:  4,
  OFFLINE:       5,
  CANCELLED:     6,
  RUMOURED:      7,
  DELISTED:      8,
} as const

// Estados que se consideran "por salir" cuando el juego NO tiene fecha
export const UPCOMING_STATUSES = [
  IGDB_RELEASE_STATUS.RUMOURED,
] as const

// Labels legibles en español para releaseStatus
export const RELEASE_STATUS_LABELS: Record<number, string> = {
  0: 'Lanzado',
  2: 'Alpha',
  3: 'Beta',
  4: 'Acceso anticipado',
  5: 'Offline',
  6: 'Cancelado',
  7: 'Rumoreado',
  8: 'Retirado',
}

export function getReleaseStatusLabel(status: number | null): string | null {
  if (status === null || status === undefined) return null
  return RELEASE_STATUS_LABELS[status] ?? null
}

// Meses en español para agrupar por fecha
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

export function formatQuarter(date: Date): string {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `Q${q} ${date.getFullYear()}`
}