// src/app/games/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReviewForm from '@/components/ReviewForm'
import ReviewCard from '@/components/ReviewCard'
import { Calendar, Tag, Monitor, Trophy, Gamepad2, Crown, Zap } from 'lucide-react'

interface GameDetailPageProps {
  params: {
    slug: string
  }
}

// Función para obtener el juego con sus reseñas
async function getGame(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  return game
}

// Función para calcular estadísticas de reseñas
function calculateReviewStats(reviews: any[]) {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: Array(10).fill(0)
    }
  }

  const total = reviews.length
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  const average = sum / total

  // Calcular distribución por puntuación (1-10)
  const distribution = Array(10).fill(0)
  reviews.forEach(review => {
    distribution[review.rating - 1]++
  })

  return { average, total, distribution }
}

// Función para obtener el icono y color basado en la puntuación
function getRatingDisplay(average: number) {
  if (average >= 9) return { 
    icon: Crown, 
    color: 'text-yellow-500 bg-yellow-100', 
    text: 'Obra Maestra',
    barColor: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  }
  if (average >= 8) return { 
    icon: Trophy, 
    color: 'text-orange-500 bg-orange-100', 
    text: 'Excelente',
    barColor: 'bg-gradient-to-r from-orange-400 to-orange-500'
  }
  if (average >= 7) return { 
    icon: Zap, 
    color: 'text-purple-500 bg-purple-100', 
    text: 'Muy Bueno',
    barColor: 'bg-gradient-to-r from-purple-400 to-purple-500'
  }
  if (average >= 6) return { 
    icon: Gamepad2, 
    color: 'text-blue-500 bg-blue-100', 
    text: 'Bueno',
    barColor: 'bg-gradient-to-r from-blue-400 to-blue-500'
  }
  if (average >= 4) return { 
    icon: Monitor, 
    color: 'text-gray-500 bg-gray-100', 
    text: 'Regular',
    barColor: 'bg-gradient-to-r from-gray-400 to-gray-500'
  }
  return { 
    icon: Monitor, 
    color: 'text-red-500 bg-red-100', 
    text: 'Mejorable',
    barColor: 'bg-gradient-to-r from-red-400 to-red-500'
  }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const session = await getServerSession(authOptions)
  const game = await getGame(params.slug)

  if (!game) {
    notFound()
  }

  const stats = calculateReviewStats(game.reviews)
  const userReview = session ? game.reviews.find(review => review.userId === session.user?.id) : null
  const ratingDisplay = getRatingDisplay(stats.average)
  
  const RatingIcon = ratingDisplay.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del juego */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Imagen del juego */}
            <div className="md:col-span-1">
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Monitor className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Información del juego */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{game.title}</h1>
              
              {game.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{game.description}</p>
              )}

              {/* Metadatos */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {game.releaseDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(game.releaseDate).toLocaleDateString('es-ES')}
                  </div>
                )}

                {game.genre.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag className="w-4 h-4 mr-2" />
                    {game.genre.join(', ')}
                  </div>
                )}

                {game.platform.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500 sm:col-span-2">
                    <Monitor className="w-4 h-4 mr-2" />
                    {game.platform.join(', ')}
                  </div>
                )}
              </div>

              {/* Puntuación promedio - ACTUALIZADA */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icono con color dinámico */}
                    <div className={`w-12 h-12 rounded-full ${ratingDisplay.color} flex items-center justify-center`}>
                      <RatingIcon className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {stats.average > 0 ? stats.average.toFixed(1) : '?'}
                        </span>
                        <span className="text-gray-500 text-lg">/ 10</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm font-medium ${ratingDisplay.color.split(' ')[0]}`}>
                          {stats.average > 0 ? ratingDisplay.text : 'Sin reseñas'}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                        </span>
                      </div>
                      
                      {/* Barra de progreso visual */}
                      {stats.average > 0 && (
                        <div className="mt-2 w-48">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${ratingDisplay.barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${(stats.average / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distribución de puntuaciones */}
                  {stats.total > 0 && (
                    <div className="hidden lg:block">
                      <div className="text-xs text-gray-500 mb-2">Distribución</div>
                      <div className="space-y-1">
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.distribution[rating - 1]
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                          
                          return (
                            <div key={rating} className="flex items-center text-xs">
                              <span className="w-6 text-gray-600 font-medium">{rating}</span>
                              <div className="w-20 h-2 bg-gray-200 rounded-full mx-2">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-6 text-gray-500">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario de reseña */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {userReview ? 'Tu Reseña' : 'Escribir Reseña'}
              </h2>
              
              {session ? (
                <ReviewForm gameId={game.id} existingReview={userReview} />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">
                    Inicia sesión para escribir una reseña
                  </p>
                  <a
                    href="/auth/signin"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Lista de reseñas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reseñas de la Comunidad ({stats.total})
                </h2>
              </div>

              <div className="divide-y">
                {game.reviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gamepad2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500">
                      Aún no hay reseñas para este juego.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      ¡Sé el primero en compartir tu opinión!
                    </p>
                  </div>
                ) : (
                  game.reviews.map((review) => (
                    <div key={review.id} className="p-6">
                      <ReviewCard 
                        review={review} 
                        currentUserId={session?.user?.id} 
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generar metadata dinámicamente
export async function generateMetadata({ params }: GameDetailPageProps) {
  const game = await getGame(params.slug)
  
  if (!game) {
    return {
      title: 'Juego no encontrado - GameNook',
    }
  }

  return {
    title: `${game.title} - GameNook`,
    description: game.description || `Reseñas y puntuaciones de ${game.title} en GameNook`,
  }
}