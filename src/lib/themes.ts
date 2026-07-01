// src/lib/themes.ts

export const THEME_TRANSLATIONS: Record<string, string> = {
  'Action':          'Acción',
  'Fantasy':         'Fantasía',
  'Science fiction': 'Ciencia ficción',
  'Horror':          'Terror',
  'Survival':        'Supervivencia',
  'Historical':      'Histórico',
  'Stealth':         'Sigilo',
  'Comedy':          'Comedia',
  'Business':        'Negocios',
  'Drama':           'Drama',
  'Non-fiction':      'No ficción',
  'Sandbox':         'Sandbox',
  'Educational':     'Educativo',
  'Kids':            'Infantil',
  'Open world':      'Mundo abierto',
  'Warfare':         'Bélico',
  'Party':           'Party',
  '4X (Explore, Expand, Exploit, Exterminate)': '4X',
  'Erotic':          'Erótico',
  'Mystery':         'Misterio',
  'Romance':         'Romance',
  'Thriller':        'Thriller',
}

export function translateTheme(theme: string): string {
  return THEME_TRANSLATIONS[theme] ?? theme
}