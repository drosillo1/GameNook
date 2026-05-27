'use client'

// src/components/CookieBanner.tsx
//
// Se monta en el layout global. Solo aparece si el usuario no ha
// respondido todavía. Guarda la decisión en localStorage bajo la
// clave 'gn-cookie-consent' con el valor 'accepted' o 'rejected'.
//
// Como las cookies de GameNook son todas técnicas/necesarias, el
// botón "Rechazar" simplemente cierra el banner — no podemos
// desactivarlas sin romper la sesión, y la ley lo permite para
// cookies estrictamente necesarias (art. 22.2 LSSI).

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'gn-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Solo mostramos el banner si el usuario no ha respondido antes.
    // Usamos un pequeño delay para que no compita visualmente con
    // la carga inicial de la página.
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function dismiss() {
    // "Rechazar" en nuestro caso solo cierra el aviso —
    // las cookies técnicas siguen activas por necesidad del servicio.
    localStorage.setItem(CONSENT_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    // Overlay con transición de entrada desde abajo
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4
                 animate-[slideUp_0.3s_ease-out]"
      style={{
        ['--tw-animate-slideUp' as string]: 'slideUp',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      <div
        className="max-w-3xl mx-auto bg-gn-card border border-white/[0.10]
                   rounded-2xl p-5 shadow-2xl
                   flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(230,57,70,0.08)' }}
      >
        {/* Icono */}
        <span className="text-2xl flex-shrink-0 hidden sm:block">🍪</span>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-gn-text text-sm font-semibold mb-1">
            Este sitio usa cookies técnicas
          </p>
          <p className="text-gn-muted text-xs leading-relaxed">
            Usamos únicamente cookies necesarias para que puedas iniciar sesión y usar
            GameNook correctamente. No hay cookies publicitarias ni de seguimiento.{' '}
            <Link
              href="/legal/cookies"
              className="text-gn-primary hover:underline"
            >
              Más información
            </Link>
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={dismiss}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold
                       uppercase tracking-wide text-gn-muted border border-white/[0.08]
                       hover:border-white/20 hover:text-gn-text rounded-lg
                       transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold
                       uppercase tracking-wide bg-gn-primary hover:bg-gn-primary-dark
                       text-white rounded-lg transition-colors
                       shadow-[0_0_12px_rgba(230,57,70,0.3)]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}