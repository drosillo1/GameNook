"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { User, LogOut, Settings, GamepadIcon } from "lucide-react"

export default function UserButton() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <Link 
        href="/auth/signin"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Iniciar Sesión
      </Link>
    )
  }

  // Obtener la imagen de perfil, priorizando image sobre avatar
  const userImage = session.user?.image || (session.user as any)?.avatar
  const userName = session.user?.name || session.user?.email

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
          {userImage ? (
            <img 
              src={userImage} 
              alt={userName || "Usuario"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Si la imagen falla al cargar, mostrar icono de usuario
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <User 
            className={`w-5 h-5 text-gray-500 ${userImage ? 'hidden' : ''}`} 
          />
        </div>
        <span className="hidden sm:inline-block text-sm font-medium">
          {userName}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú desplegable */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-gray-500">{session.user?.email}</div>
              </div>
              
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Mi Perfil
              </Link>
              
              <Link
                href="/games"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Mis Juegos
              </Link>
              
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Link>
              
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}