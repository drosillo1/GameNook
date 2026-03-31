// src/components/HeroCharacters.tsx
'use client'

import { useRef, useEffect } from 'react'
import CharacterWarrior from './CharacterWarrior'
import CharacterMage from './CharacterMage'

export default function HeroCharacters() {
  const warriorRef = useRef<HTMLDivElement>(null)
  const mageRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx   // -1 a 1
      const dy = (e.clientY - cy) / cy

      if (warriorRef.current) {
        warriorRef.current.style.transform =
          `translate(${dx * -14}px, ${dy * -7}px)`
      }
      if (mageRef.current) {
        mageRef.current.style.transform =
          `translate(${dx * 10}px, ${dy * -9}px)`
      }
    }

    const handleMouseLeave = () => {
      if (warriorRef.current) warriorRef.current.style.transform = ''
      if (mageRef.current)    mageRef.current.style.transform    = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Warrior — izquierda */}
      <div
        className="absolute bottom-0 left-0 xl:left-[4%] hidden lg:block
                   pointer-events-none select-none transition-transform duration-100"
        ref={warriorRef}
      >
        <CharacterWarrior />
        {/* Sombra en el suelo */}
        <div className="w-20 h-2.5 mx-auto rounded-full
                        bg-[radial-gradient(ellipse,rgba(255,255,255,0.06)_0%,transparent_70%)]
                        animate-[shadow-pulse_4s_ease-in-out_infinite]" />
      </div>

      {/* Mage — derecha */}
      <div
        className="absolute bottom-0 right-0 xl:right-[4%] hidden lg:block
                   pointer-events-none select-none transition-transform duration-100"
        ref={mageRef}
      >
        <CharacterMage />
        <div className="w-20 h-2.5 mx-auto rounded-full
                        bg-[radial-gradient(ellipse,rgba(230,57,70,0.2)_0%,transparent_70%)]
                        animate-[shadow-pulse_3.5s_ease-in-out_infinite_0.5s]" />
      </div>
    </>
  )
}