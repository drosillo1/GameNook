// src/components/Counter.tsx
'use client'

import { useState, useEffect, useRef } from 'react'

interface CounterProps {
  end:      number
  duration?: number
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function Counter({ end, duration = 1200 }: CounterProps) {
  const [count,   setCount]   = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let frame: number
    const startTime = performance.now()
    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

    const tick = (now: number) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(easeOutExpo(progress) * end))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setCount(end)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return <span ref={ref}>{formatCount(count)}</span>
}