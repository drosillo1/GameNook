// src/app/games/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlusIcon, SearchIcon } from 'lucide-react'

async function getGames() {
  const games = await prisma.game.findMany({
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  })

  // Calcular rating promedio para cada juego
  return games.map(game => ({
    ...game,
    averageRating: game.reviews.length > 0 
      ? game.reviews.reduce((sum, review) => sum + review.rating, 0) / game.reviews.length
      : null,
  }))
}

function GameCard({ game }: { game: any }) {
  return (
    <Link 
      href={`/games/${game.slug}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 hover:border-indigo-300"
    >
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {game.imageUrl ? (
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                🎮
              </div>
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {game.title}
        </h3>
        
        {game.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {game.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {game.averageRating ? (
              <div className="flex items-center">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium text-gray-700 ml-1">
                  {game.averageRating.toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Sin reseñas</span>
            )}
          </div>
          
          <span className="text-xs text-gray-500">
            {game._count.reviews} {game._count.reviews === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
        
        {game.genre && game.genre.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {game.genre.slice(0, 3).map((g: string) => (
                <span 
                  key={g}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  {g}
                </span>
              ))}
              {game.genre.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{game.genre.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

function GamesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Juegos</h1>
              <p className="text-gray-600 mt-1">
                Descubre y reseña tus videojuegos favoritos
              </p>
            </div>
            
            {session && (
              <Link
                href="/games/add"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Agregar Juego
              </Link>
            )}
          </div>
          
          {/* Barra de búsqueda */}
          <div className="mt-6">
            <form method="GET" className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Buscar juegos..."
                defaultValue={searchParams.search || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<GamesSkeleton />}>
          <GamesGrid searchQuery={searchParams.search} />
        </Suspense>
      </div>
    </div>
  )
}

async function GamesGrid({ searchQuery }: { searchQuery?: string }) {
  let games = await getGames()
  
  // Filtrar por búsqueda si existe
  if (searchQuery) {
    games = games.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
          🎮
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {searchQuery ? 'No se encontraron juegos' : 'No hay juegos disponibles'}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchQuery 
            ? `No encontramos juegos que coincidan con "${searchQuery}"`
            : 'Sé el primero en agregar un juego a la plataforma'
          }
        </p>
        <Link
          href="/games/add"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar Juego
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}