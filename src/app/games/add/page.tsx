// src/app/games/add/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react'

export default function AddGamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    releaseDate: '',
    genre: [] as string[],
    platform: [] as string[],
  })
  
  const [newGenre, setNewGenre] = useState('')
  const [newPlatform, setNewPlatform] = useState('')

  // Opciones predefinidas
  const commonGenres = [
    'Acción', 'Aventura', 'RPG', 'Estrategia', 'Simulación', 'Deportes',
    'Racing', 'Shooter', 'Puzzle', 'Plataformas', 'Fighting', 'Horror',
    'MMORPG', 'Sandbox', 'Survival', 'Roguelike', 'Indie', 'Casual'
  ]
  
  const commonPlatforms = [
    'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
    'Nintendo Switch', 'Steam', 'Epic Games', 'iOS', 'Android', 'Mac', 'Linux'
  ]

  if (status === 'loading') {
    return <div>Cargando...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('El título es requerido')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el juego')
      }

      const game = await response.json()
      router.push(`/games/${game.slug}`)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addGenre = (genre: string) => {
    if (genre.trim() && !formData.genre.includes(genre.trim())) {
      setFormData(prev => ({
        ...prev,
        genre: [...prev.genre, genre.trim()]
      }))
    }
    setNewGenre('')
  }

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.filter(g => g !== genre)
    }))
  }

  const addPlatform = (platform: string) => {
    if (platform.trim() && !formData.platform.includes(platform.trim())) {
      setFormData(prev => ({
        ...prev,
        platform: [...prev.platform, platform.trim()]
      }))
    }
    setNewPlatform('')
  }

  const removePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.filter(p => p !== platform)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link 
              href="/games"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agregar Juego</h1>
              <p className="text-gray-600 mt-1">
                Añade un nuevo videojuego a la plataforma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Juego *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: The Legend of Zelda: Breath of the Wild"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Descripción del juego..."
              />
            </div>

            {/* URL de imagen */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL de la Imagen
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Fecha de lanzamiento */}
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Lanzamiento
              </label>
              <input
                type="date"
                id="releaseDate"
                value={formData.releaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Géneros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Géneros
              </label>
              
              {/* Géneros seleccionados */}
              {formData.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.genre.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Géneros comunes */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                {commonGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => addGenre(genre)}
                    disabled={formData.genre.includes(genre)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.genre.includes(genre)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
              {/* Input para género personalizado */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Género personalizado..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addGenre(newGenre)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addGenre(newGenre)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Plataformas (similar a géneros) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataformas
              </label>
              
              {/* Plataformas seleccionadas */}
              {formData.platform.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.platform.map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {platform}
                      <button
                        type="button"
                        onClick={() => removePlatform(platform)}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Plataformas comunes */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                {commonPlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => addPlatform(platform)}
                    disabled={formData.platform.includes(platform)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.platform.includes(platform)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              
              {/* Input para plataforma personalizada */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="Plataforma personalizada..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addPlatform(newPlatform)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addPlatform(newPlatform)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href="/games"
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creando...' : 'Crear Juego'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}