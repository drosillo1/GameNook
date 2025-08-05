// src/app/page.tsx
import Link from 'next/link'
import UserButton from '@/components/UserButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tu biblioteca de
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" videojuegos"}
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubre, reseña y comparte tus videojuegos favoritos. 
            Conecta con otros gamers y encuentra tu próxima aventura.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/games" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors inline-block icon-animate">
              Explorar juegos
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Reseña tus juegos</h3>
              <p className="text-gray-400">Puntúa del 1 al 10 y escribe reseñas detalladas de tus videojuegos favoritos.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tu biblioteca personal</h3>
              <p className="text-gray-400">Mantén un registro de todos los juegos que has jugado y tus calificaciones.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Comunidad gamer</h3>
              <p className="text-gray-400">Conecta con otros jugadores, lee sus reseñas y participa en foros de juegos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}