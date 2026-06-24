'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { GamepadIcon } from 'lucide-react'
import Image from 'next/image'

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [name,        setName]        = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/user/name', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar el nombre')
      }

      // Actualiza la sesión en cliente para que Navigation lo refleje de inmediato
      await update({ name: name.trim() })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gn-bg font-body flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image
            src="/icon-512.png"
            alt="GameNook"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-black text-xl tracking-wide">
            <span className="text-gn-text">Game</span>
            <span className="text-gn-primary">Nook</span>
          </span>
        </div>

        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8">
          <p className="text-gn-primary text-xs font-bold uppercase tracking-widest mb-1">
            // Bienvenido
          </p>
          <h1 className="font-display font-black text-2xl text-gn-text mb-2">
            ¿Cómo te llamamos?
          </h1>
          <p className="text-gn-muted text-sm mb-6 leading-relaxed">
            Elige el nombre que verá la comunidad en tus reseñas y tu perfil.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                              px-3 py-2.5 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gn-muted text-xs font-semibold uppercase
                                 tracking-widest mb-1.5">
                Nombre o alias
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: DarkHunter99"
                maxLength={32}
                autoFocus
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                           px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-muted
                           focus:outline-none focus:border-gn-primary/40
                           focus:ring-1 focus:ring-gn-primary/20 transition-all"
              />
              <p className="text-gn-subtle text-xs mt-1 text-right">
                {name.length}/32
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full bg-gn-primary hover:bg-gn-primary-dark disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-bold uppercase
                         tracking-wider text-sm py-3 rounded-lg shadow-gn-red
                         transition-all duration-200"
            >
              {isSubmitting ? '⏳ Guardando...' : '▶ Entrar a GameNook'}
            </button>
          </form>
        </div>

        <p className="text-center text-gn-subtle text-xs mt-4">
          Podrás cambiarlo más adelante desde tu perfil.
        </p>
      </div>
    </div>
  )
}