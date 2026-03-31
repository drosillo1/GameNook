"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { GamepadIcon } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    getSession().then(session => {
      if (session) router.push(callbackUrl)
    })
    if (searchParams.get('error')) {
      setError('Hubo un problema con el inicio de sesión. Inténtalo de nuevo.')
    }
  }, [callbackUrl, router, searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await signIn('google', { callbackUrl, redirect: false })
      if (result?.error) {
        setError('Error al iniciar sesión con Google')
        setIsLoading(false)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gn-bg font-body flex items-center justify-center px-6 relative overflow-hidden">

      {/* Fondo */}
      <div className="absolute inset-0 bg-gn-hero-glow" />
      <div
        className="absolute inset-0 bg-gn-grid"
        style={{
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gn-primary rounded-lg flex items-center justify-center">
              <GamepadIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-2xl tracking-wide">
              <span className="text-gn-text">Game</span>
              <span className="text-gn-primary">Nook</span>
            </span>
          </div>
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-1">
            // Acceso a la plataforma
          </p>
          <h1 className="font-display font-black text-2xl text-gn-text">
            Bienvenido de vuelta
          </h1>
          <p className="text-gn-muted text-sm mt-1">
            Únete a la comunidad de gamers
          </p>
        </div>

        {/* Card */}
        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8">

          {error && (
            <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                            px-4 py-3 rounded-lg text-sm font-semibold mb-5">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3
                       bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                       text-gray-800 font-bold text-sm uppercase tracking-wider
                       px-5 py-3.5 rounded-xl transition-all duration-200
                       hover:-translate-y-0.5 shadow-lg shadow-black/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800
                                rounded-full animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-gn-muted text-xs leading-relaxed">
              Al iniciar sesión aceptas los términos de uso de la plataforma.
              Tus datos solo se usan para identificarte en GameNook.
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-5">
          <button
            onClick={() => router.push('/')}
            className="text-gn-muted hover:text-gn-text text-sm transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}