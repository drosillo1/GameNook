// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gn-bg font-body flex items-center
                    justify-center px-6 relative overflow-hidden">

      {/* Fondo */}
      <div className="absolute inset-0"
           style={{
             background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(230,57,70,0.08) 0%, transparent 70%)',
           }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <div className="relative text-center max-w-md">

        {/* Número 404 */}
        <div className="relative mb-6">
          <div
            className="font-display font-black text-[10rem] leading-none
                       text-gn-primary/10 select-none"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            404
          </div>
          {/* Icono encima del 404 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gn-card border border-white/[0.08] rounded-2xl
                            px-6 py-4 backdrop-blur-sm">
              <div className="text-5xl mb-1">🎮</div>
              <div
                className="font-display font-black text-2xl text-gn-primary"
                style={{
                  fontFamily:  'Orbitron, monospace',
                  textShadow: '0 0 20px rgba(230,57,70,0.5)',
                }}
              >
                404
              </div>
            </div>
          </div>
        </div>

        {/* Texto */}
        <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-2">
          // Página no encontrada
        </p>
        <h1 className="font-display font-black text-2xl text-gn-text mb-3"
            style={{ fontFamily: 'Orbitron, monospace' }}>
          Game Over
        </h1>
        <p className="text-gn-muted text-sm leading-relaxed mb-8">
          Esta página no existe o fue eliminada.<br />
          Vuelve al inicio y sigue explorando.
        </p>

        {/* Acciones */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-gn-primary hover:bg-gn-primary-dark text-white font-bold
                       uppercase tracking-wider text-sm px-6 py-2.5 rounded-lg
                       shadow-gn-red transition-all duration-200 hover:-translate-y-0.5"
          >
            ▶ Volver al inicio
          </Link>
          <Link
            href="/games"
            className="border border-gn-subtle hover:border-gn-muted text-gn-text
                       font-semibold uppercase tracking-wider text-sm px-6 py-2.5
                       rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            Ver juegos
          </Link>
        </div>

        {/* Easter egg retro */}
        <p className="text-gn-subtle text-xs mt-8 font-mono">
          INSERT COIN TO CONTINUE...
        </p>
      </div>
    </div>
  )
}