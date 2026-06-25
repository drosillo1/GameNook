// src/components/GameDescription.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  description: string
}

export default function GameDescription({ description }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [needsClamp, setNeedsClamp] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  // Comprobar si el texto realmente desborda las 4 líneas — si no,
  // no mostramos el botón "Ver más" para un texto que ya cabe entero.
  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setNeedsClamp(el.scrollHeight > el.clientHeight + 1)
  }, [description])

  return (
    <div>
      <p
        ref={textRef}
        className={`text-gn-muted text-sm leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}
      >
        {description}
      </p>

      {(needsClamp || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 mt-1.5 text-gn-primary hover:text-gn-primary-dark
                     text-xs font-semibold uppercase tracking-wide transition-colors"
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Ver más <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  )
}