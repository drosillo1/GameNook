// src/lib/genres.ts

export const GENRE_TRANSLATIONS: Record<string, string> = {
  'Action':                      'Acción',
  'Arcade':                      'Arcade',
  'Adventure':                   'Aventura',
  'Racing':                      'Carreras',
  'Card & Board Game':           'Cartas y tablero',
  'Sport':                       'Deportes',
  'Strategy':                    'Estrategia',
  'Turn-based strategy (TBS)':   'Estrategia por turnos',
  'Real Time Strategy (RTS)':    'Estrategia RTS',
  'Hack and slash/Beat \'em up': 'Hack & Slash',
  'Indie':                       'Indie',
  'Fighting':                    'Lucha',
  'MOBA':                        'MOBA',
  'Music':                       'Música',
  'Visual Novel':                'Novela visual',
  'Platform':                    'Plataformas',
  'Platformer':                  'Plataformas',
  'Point-and-click':             'Point & Click',
  'Puzzle':                      'Puzle',
  'Role-playing (RPG)':          'RPG',
  'Shooter':                     'Shooter',
  'Simulation':                  'Simulación',
  'Simulator':                   'Simulación',
  'Tactical':                    'Táctico',
  'Horror':                      'Terror',
};

// Icono lucide-react representativo por género — usado en la sección
// "Géneros favoritos" del perfil. Deliberadamente distinto de
// Sword/Heart/Shield/Medal/Trophy/Crown (esos son de @pxlkit/gamification
// y están reservados al sistema de rating, para no mezclar significados visuales).
export const GENRE_ICONS_LUCIDE: Record<string, string> = {
  'Acción':                'Swords',
  'Arcade':                'Joystick',
  'Aventura':              'Compass',
  'Carreras':              'Car',
  'Cartas y tablero':      'Spade',
  'Deportes':              'Trophy',
  'Estrategia':            'Brain',
  'Estrategia por turnos': 'Hourglass',
  'Estrategia RTS':        'Castle',
  'Hack & Slash':          'Axe',
  'Indie':                 'Sparkles',
  'Lucha':                 'Hand',
  'MOBA':                  'Users',
  'Música':                'Music',
  'Novela visual':         'BookOpen',
  'Plataformas':           'Footprints',
  'Point & Click':         'MousePointer2',
  'Puzle':                 'Puzzle',
  'RPG':                   'ScrollText',
  'Shooter':               'Target',
  'Simulación':            'Settings2',
  'Táctico':               'Crosshair',
  'Terror':                'Ghost',
}

// Color de acento por género — usado junto al icono en "Géneros favoritos"
// para dar identidad propia a cada categoría, en vez de un único color por ranking.
export const GENRE_COLORS: Record<string, string> = {
  'Acción':                '#e63946', // rojo primary — intensidad/combate
  'Arcade':                '#fbbf24', // amarillo — diversión clásica
  'Aventura':              '#10b981', // verde — exploración
  'Carreras':              '#f97316', // naranja — velocidad
  'Cartas y tablero':      '#a855f7', // morado accent — estrategia de mesa
  'Deportes':              '#3b82f6', // azul — competición
  'Estrategia':            '#06b6d4', // cian — mente/táctica
  'Estrategia por turnos': '#0ea5e9', // azul claro — variante de estrategia
  'Estrategia RTS':        '#6366f1', // índigo — variante de estrategia
  'Hack & Slash':          '#b52d38', // rojo oscuro — combate intenso
  'Indie':                 '#ec4899', // rosa — creatividad/originalidad
  'Lucha':                 '#dc2626', // rojo fuerte — combate directo
  'MOBA':                  '#8b5cf6', // violeta — equipo/competitivo
  'Música':                '#f4a261', // naranja secondary — ritmo
  'Novela visual':         '#c084fc', // lila — narrativa
  'Plataformas':           '#22c55e', // verde vivo — movimiento/saltos
  'Point & Click':         '#eab308', // amarillo oscuro — puzles de exploración
  'Puzle':                 '#14b8a6', // teal — lógica
  'RPG':                   '#a855f7', // morado accent — fantasía/progresión
  'Shooter':               '#ef4444', // rojo vivo — acción directa
  'Simulación':            '#06b6d4', // cian — sistemas/precisión
  'Táctico':               '#0891b2', // cian oscuro — planificación
  'Terror':                '#71717a', // gris oscuro — tensión/oscuridad
}

// Helper para traducir un género
export function translateGenre(genre: string): string {
  return GENRE_TRANSLATIONS[genre] ?? genre
}

// Helper para traducir un array de géneros
export function translateGenres(genres: string[]): string[] {
  return genres.map(translateGenre)
}

// Helper para obtener el icono lucide-react de un género (recibe el género en
// español, ya traducido) — devuelve 'Gamepad2' como fallback genérico si no hay mapeo.
export function getGenreIconLucide(translatedGenre: string): string {
  return GENRE_ICONS_LUCIDE[translatedGenre] ?? 'Gamepad2'
}

export function getGenreColor(translatedGenre: string): string {
  return GENRE_COLORS[translatedGenre] ?? '#8b8b9e'
}