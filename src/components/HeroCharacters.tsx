// src/components/HeroCharacters.tsx
'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import CharacterWarrior from './CharacterWarrior'
import CharacterMage from './CharacterMage'

export default function HeroCharacters() {
  const warriorRef    = useRef<HTMLDivElement>(null)
  const mageRef       = useRef<HTMLDivElement>(null)
  const [glowPos,     setGlowPos]     = useState({ x: 50, y: 30 })
  const [warriorHit,  setWarriorHit]  = useState(false)
  const [mageAttack,  setMageAttack]  = useState(false)
  const [mageRipples, setMageRipples] = useState<number[]>([])

  // ── Parallax ──────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const cx = window.innerWidth  / 2
        const cy = window.innerHeight / 2
        const dx = (e.clientX - cx) / cx
        const dy = (e.clientY - cy) / cy

        setGlowPos({
          x: (e.clientX / window.innerWidth)  * 100,
          y: (e.clientY / window.innerHeight) * 100,
        })

        if (warriorRef.current) {
          warriorRef.current.style.transform =
            `translate(${dx * -18}px, ${dy * -8}px)`
        }
        if (mageRef.current) {
          mageRef.current.style.transform =
            `translate(${dx * 22}px, ${dy * -14}px)`
        }
      })
    }

    const handleMouseLeave = () => {
      if (warriorRef.current) warriorRef.current.style.transform = ''
      if (mageRef.current)    mageRef.current.style.transform    = ''
      setGlowPos({ x: 50, y: 30 })
    }

    window.addEventListener('mousemove',  handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove',  handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // ── Warrior click — shake (recibe daño) ──────────────────────
  const handleWarriorClick = useCallback(() => {
    if (warriorHit) return
    setWarriorHit(true)
    setTimeout(() => setWarriorHit(false), 600)
  }, [warriorHit])

  // ── Mage click — glow pulse + ripple mágico ──────────────────
  const handleMageClick = useCallback(() => {
    if (mageAttack) return
    setMageAttack(true)
    setTimeout(() => setMageAttack(false), 700)

    // Añadir una onda que se expande y desaparece
    const id = Date.now()
    setMageRipples(prev => [...prev, id])
    setTimeout(() => {
      setMageRipples(prev => prev.filter(r => r !== id))
    }, 800)
  }, [mageAttack])

  return (
    <>
      {/* Glow dinámico */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%,
            rgba(230,57,70,0.14) 0%, transparent 55%)`,
        }}
      />

      {/* ── Warrior — izquierda ── */}
      <div
        ref={warriorRef}
        onClick={handleWarriorClick}
        className="absolute bottom-0 left-[-3%] xl:left-[3%] hidden lg:flex
                   flex-col items-center select-none
                   transition-transform duration-150 ease-out
                   cursor-pointer"
        style={{
          // Shake: secuencia de translaciones rápidas en X
          animation: warriorHit ? 'warrior-shake 0.5s ease-out' : undefined,
          filter: warriorHit
            ? 'drop-shadow(0 0 12px rgba(230,57,70,0.8)) brightness(1.3)'
            : undefined,
        }}
      >
        <CharacterWarrior />

        {/* Número de daño flotante */}
        {warriorHit && (
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2
                       font-display font-black text-2xl text-gn-primary
                       pointer-events-none"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px rgba(230,57,70,0.8)',
              animation:  'damage-float 0.6s ease-out forwards',
            }}
          >
            -99
          </div>
        )}

        <div className="w-20 h-2.5 rounded-full blur-md -mt-4 bg-black/30" />
      </div>

      {/* ── Mage — derecha ── */}
      <div
        ref={mageRef}
        onClick={handleMageClick}
        className="absolute bottom-0 right-[-3%] xl:right-[3%] hidden lg:flex
                   flex-col items-center select-none
                   transition-transform duration-[100ms] ease-out z-20
                   cursor-pointer"
        style={{
          animation: mageAttack ? 'mage-pulse 0.7s ease-out' : undefined,
          filter: mageAttack
            ? 'drop-shadow(0 0 20px rgba(168,85,247,0.9)) brightness(1.4)'
            : 'drop-shadow(0 0 6px rgba(168,85,247,0.3))',
        }}
      >
        <CharacterMage />

        {/* Ondas mágicas que se expanden desde el mago */}
        {mageRipples.map(id => (
          <div
            key={id}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border:    '2px solid rgba(168,85,247,0.7)',
              animation: 'mage-ripple 0.8s ease-out forwards',
            }}
          />
        ))}

        {/* Texto de hechizo */}
        {mageAttack && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2
                       font-display font-black text-sm text-purple-400
                       pointer-events-none whitespace-nowrap"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px rgba(168,85,247,0.9)',
              animation:  'damage-float 0.7s ease-out forwards',
            }}
          >
          </div>
        )}

        <div
          className="w-20 h-2.5 rounded-full blur-md -mt-4"
          style={{ background: 'rgba(168,85,247,0.3)' }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes warrior-shake {
          0%   { transform: translateX(0)    rotate(0deg);   }
          15%  { transform: translateX(-8px) rotate(-3deg);  }
          30%  { transform: translateX(8px)  rotate(3deg);   }
          45%  { transform: translateX(-6px) rotate(-2deg);  }
          60%  { transform: translateX(6px)  rotate(2deg);   }
          75%  { transform: translateX(-3px) rotate(-1deg);  }
          100% { transform: translateX(0)    rotate(0deg);   }
        }

        @keyframes mage-pulse {
          0%   { transform: scale(1);    }
          20%  { transform: scale(1.08) rotate(-2deg); }
          50%  { transform: scale(0.96) rotate(1deg);  }
          75%  { transform: scale(1.03);               }
          100% { transform: scale(1);                  }
        }

        @keyframes mage-ripple {
          0%   { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0;   }
        }

        @keyframes damage-float {
          0%   { transform: translateX(-50%) translateY(0);    opacity: 1; }
          100% { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        }
      `}</style>
    </>
  )
}