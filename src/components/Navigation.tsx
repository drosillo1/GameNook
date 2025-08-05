// src/components/Navigation.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { UserIcon, LogOutIcon, GamepadIcon, HomeIcon, ChevronDownIcon } from 'lucide-react'

export default function Navigation() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <GamepadIcon className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">GameNook</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Inicio
              </Link>
              <Link 
                href="/games" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Juegos
              </Link>
            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Usuario'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú desplegable */}
                {showUserMenu && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-3" />
                          Mi Perfil
                        </Link>
                        <button
                          onClick={() => {
                            signOut()
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOutIcon className="w-4 h-4 mr-3" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                    
                    {/* Overlay para cerrar el menú */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          <Link 
            href="/" 
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Inicio
          </Link>
          <Link 
            href="/games" 
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Juegos
          </Link>
        </div>
      </div>
    </nav>
  )
}