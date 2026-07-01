// src/lib/perspectives.ts

export const PERSPECTIVE_TRANSLATIONS: Record<string, string> = {
  'First person':          'Primera persona',
  'Third person':          'Tercera persona',
  'Bird view / Isometric': 'Vista cenital / Isométrica',
  'Bird view':             'Vista cenital',
  'Isometric':             'Isométrica',
  'Side view':             'Vista lateral',
  'Text':                  'Texto',
  'Auditory':              'Auditivo',
  'Virtual Reality':       'Realidad virtual',
}

export function translatePerspective(perspective: string): string {
  return PERSPECTIVE_TRANSLATIONS[perspective] ?? perspective
}