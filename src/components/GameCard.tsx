// src/components/GameCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { translateGenre } from '@/lib/genres'

/**
 * Forma mínima que necesita la card. Definida aquí (en vez de importar `Game`
 * de `@/types/games`) para que cualquier consumidor pueda pasar su propio tipo
 * siempre que tenga estos campos — catálogo, recomendaciones, etc.
 */
export interface GameCardGame {
  id:             string
  slug:           string
  title:          string
  imageUrl:       string | null
  genre:          string[]
  averageRating?: number | null
  _count:         { reviews: number }
}

export function getRatingMeta(rating: number | null | undefined) {
  if (!rating) return { icon: '🎮', color: '#6b7280' }
  if (rating >= 9)  return { icon: '👑', color: '#fbbf24' }
  if (rating >= 7)  return { icon: '🏆', color: '#f97316' }
  if (rating >= 5)  return { icon: '⚡', color: '#a855f7' }
  if (rating >= 3)  return { icon: '❤️', color: '#3b82f6' }
  return                { icon: '🎮', color: '#6b7280' }
}

export default function GameCard({
  game,
  priority = false,
}: {
  game: GameCardGame
  priority?: boolean
}) {
  const meta = getRatingMeta(game.averageRating)

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-gn-card border border-white/[0.06] rounded-xl
                 overflow-hidden hover:border-gn-primary/30 hover:-translate-y-1
                 transition-all duration-200 flex flex-col"
    >
      <div className="aspect-[3/4] bg-gn-surface relative overflow-hidden">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            // next/image lanza un error si recibe `priority` y `loading="lazy"`
            // a la vez, así que se aplica uno u otro, nunca ambos.
            {...(priority ? { priority: true } : { loading: 'lazy' as const })}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gn-muted">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                     rounded-md border text-xs font-bold backdrop-blur-sm bg-gn-bg/80"
          style={{ borderColor: `${meta.color}40`, color: meta.color }}
        >
          {game.averageRating ? (
            <>
              <span>{meta.icon}</span>
              <span style={{ fontFamily: 'Orbitron, monospace' }}>
                {game.averageRating.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-gn-subtle">—</span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="font-display font-bold text-xs tracking-wide text-gn-text
                     group-hover:text-gn-primary transition-colors truncate mb-1"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {game.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {game.genre.slice(0, 2).map(g => (
            <span
              key={g}
              className="px-1.5 py-0.5 bg-gn-primary/8 border border-gn-primary/15
                         text-red-300 text-[10px] font-semibold uppercase tracking-wide rounded"
            >
              {translateGenre(g)}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] text-gn-muted">
            {game._count.reviews}{' '}
            {game._count.reviews === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
      </div>
    </Link>
  )
}