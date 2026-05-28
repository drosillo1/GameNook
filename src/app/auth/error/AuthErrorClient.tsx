'use client'

// src/app/auth/error/AuthErrorClient.tsx
import { useSearchParams, useRouter } from 'next/navigation'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title:       'Error de configuración',
    description: 'Hay un problema con la configuración del servidor. Contacta con el administrador.',
  },
  AccessDenied: {
    title:       'Acceso denegado',
    description: 'No tienes permiso para acceder con esta cuenta.',
  },
  Verification: {
    title:       'Enlace caducado',
    description: 'El enlace de acceso ha expirado o ya fue utilizado. Solicita uno nuevo.',
  },
  Default: {
    title:       'Error de autenticación',
    description: 'Ocurrió un error durante el proceso de inicio de sesión.',
  },
}

export default function AuthErrorClient() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const errorKey = searchParams.get('error') ?? 'Default'
  const { title, description } = ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default

  return (
    <div className="min-h-screen bg-gn-bg font-body flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8 text-center">

          {/* Icono */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gn-primary/10
                          border border-gn-primary/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>

          {/* Eyebrow */}
          <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-2">
            // Auth
          </p>

          {/* Título */}
          <h1
            className="font-display font-black text-2xl text-gn-text mb-3"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {title}
          </h1>

          {/* Descripción */}
          <p className="text-gn-muted text-sm leading-relaxed mb-8">
            {description}
          </p>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full py-2.5 bg-gn-primary hover:bg-gn-primary-dark text-white
                         text-sm font-bold uppercase tracking-wider rounded-lg
                         transition-colors shadow-[0_0_12px_rgba(230,57,70,0.3)]"
            >
              ▶ Intentar de nuevo
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 border border-white/[0.08] hover:border-white/20
                         text-gn-muted hover:text-gn-text text-sm font-semibold
                         uppercase tracking-wider rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}