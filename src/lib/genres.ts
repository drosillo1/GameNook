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

// Helper para traducir un género
export function translateGenre(genre: string): string {
  return GENRE_TRANSLATIONS[genre] ?? genre
}

// Helper para traducir un array de géneros
export function translateGenres(genres: string[]): string[] {
  return genres.map(translateGenre)
}