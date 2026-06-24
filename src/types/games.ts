export type SortKey =
  | 'popular'
  | 'rating_desc'
  | 'reviews_desc'
  | 'release_desc'
  | 'release_asc'
  | 'title_asc'
  | 'title_desc'
  | 'added_desc'

export interface Game {
  id: string
  title: string
  slug: string
  imageUrl: string | null
  releaseDate: string | null
  genre: string[]
  platform: string[]
  igdbRating: number | null
  igdbRatingCount: number | null
  averageRating: number | null
  createdAt: string
  _count: { reviews: number }
}

export interface FilterOptions {
  genres: string[]
  platforms: string[]
  years: number[]
}

export interface PaginatedGames {
  items: Game[]
  total: number
}