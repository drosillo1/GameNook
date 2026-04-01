// src/app/auth/verify-request/page.tsx
import Link from 'next/link'
import { GamepadIcon, MailIcon } from 'lucide-react'

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gn-bg font-body flex items-center
                    justify-center px-6 relative overflow-hidden">

      <div className="absolute inset-0 bg-gn-hero-glow" />
      <div
        className="absolute inset-0 bg-gn-grid"
        style={{
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm text-center">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gn-primary rounded-lg flex items-center justify-center">
            <GamepadIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-2xl tracking-wide">
            <span className="text-gn-text">Game</span>
            <span className="text-gn-primary">Nook</span>
          </span>
        </div>

        <div className="bg-gn-card border border-white/[0.06] rounded-2xl p-8">

          {/* Icono email */}
          <div className="w-16 h-16 bg-gn-primary/10 border border-gn-primary/20
                          rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MailIcon className="w-8 h-8 text-gn-primary" />
          </div>

          <p className="text-gn-primary text-xs font-semibold uppercase
                        tracking-widest mb-2">
            // Revisa tu email
          </p>

          <h1 className="font-display font-black text-2xl text-gn-text mb-3">
            Enlace enviado
          </h1>

          <p className="text-gn-muted text-sm leading-relaxed mb-6">
            Te hemos enviado un enlace mágico de acceso.
            Haz click en él para entrar a GameNook.
            <br /><br />
            El enlace expira en <span className="text-gn-text font-semibold">24 horas</span>.
          </p>

          {/* Tips */}
          <div className="bg-gn-surface border border-white/[0.04] rounded-xl
                          p-4 text-left mb-6">
            <p className="text-gn-muted text-xs font-semibold uppercase
                          tracking-widest mb-2">
              ¿No lo ves?
            </p>
            <ul className="space-y-1.5 text-gn-muted text-xs leading-relaxed">
              <li>→ Revisa la carpeta de spam</li>
              <li>→ El email viene de <span className="text-gn-text">noreply@gamenook</span></li>
              <li>→ Puede tardar hasta 1-2 minutos</li>
            </ul>
          </div>

          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gn-muted hover:text-gn-text
                       text-sm transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}