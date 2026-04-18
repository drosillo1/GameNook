// src/components/ScrollingText.tsx
'use client'

import { useState, useEffect } from 'react'

interface Props {
  words:    string[]
  interval?: number
}

export function ScrollingText({ words, interval = 2500 }: Props) {
  const [index,   setIndex]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out → cambiar palabra → fade in
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % words.length)
        setVisible(true)
      }, 300) // duración del fade out
    }, interval)
    return () => clearInterval(timer)
  }, [words, interval])

  return (
    <span
      className="relative inline-block text-gn-primary transition-all duration-300"
      style={{
        opacity:     visible ? 1 : 0,
        transform:   visible ? 'translateY(0)' : 'translateY(12px)',
        textShadow:  '0 0 40px rgba(230,57,70,0.5)',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {words[index]}
    </span>
  )
}