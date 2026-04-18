// src/components/HeroCharacters.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import CharacterWarrior from './CharacterWarrior'
import CharacterMage from './CharacterMage'

export default function HeroCharacters() {
  const warriorRef = useRef<HTMLDivElement>(null)
  const mageRef    = useRef<HTMLDivElement>(null)
  const [glowPos,  setGlowPos] = useState({ x: 50, y: 30 })

  useEffect(() => {
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const cx = window.innerWidth  / 2
        const cy = window.innerHeight / 2
        const dx = (e.clientX - cx) / cx  // -1 a 1
        const dy = (e.clientY - cy) / cy

        // Glow sigue al cursor
        setGlowPos({
          x: (e.clientX / window.innerWidth)  * 100,
          y: (e.clientY / window.innerHeight) * 100,
        })

        // Warrior más lento → parece más lejos (profundidad)
        if (warriorRef.current) {
          warriorRef.current.style.transform =
            `translate(${dx * -18}px, ${dy * -8}px)`
        }
        // Mage más rápido → parece más cerca
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

  return (
    <>
      {/* Glow dinámico que sigue al cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-none"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%,
            rgba(230,57,70,0.14) 0%, transparent 55%)`,
        }}
      />

      {/* Warrior — izquierda, más atrás */}
      <div
        ref={warriorRef}
        className="absolute bottom-0 left-[-3%] xl:left-[3%] hidden lg:flex
                   flex-col items-center pointer-events-none select-none
                   transition-transform duration-150 ease-out"
      >
        <CharacterWarrior />
        <div className="w-20 h-2.5 rounded-full blur-md -mt-4
                        bg-black/30" />
      </div>

      {/* Mage — derecha, más cerca */}
      <div
        ref={mageRef}
        className="absolute bottom-0 right-[-3%] xl:right-[3%] hidden lg:flex
                   flex-col items-center pointer-events-none select-none
                   transition-transform duration-[100ms] ease-out z-20"
      >
        <CharacterMage />
        <div className="w-20 h-2.5 rounded-full blur-md -mt-4"
             style={{ background: 'rgba(230,57,70,0.25)' }} />
      </div>
    </>
  )
}