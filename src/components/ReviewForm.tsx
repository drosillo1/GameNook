// src/components/ReviewForm.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PxlKitIcon } from '@pxlkit/core'
import { Crown, Trophy, Medal, Shield, Heart, Sword } from '@pxlkit/gamification'
import { PencilIcon } from 'lucide-react'
import RatingGaming from './RatingGaming'
import { toast } from '@/lib/toast'
import { getRatingData } from '@/lib/rating'

interface ReviewFormProps {
  gameId: string
  existingReview?: { id: string; rating: number; content: string | null } | null
}

const ICON_MAP = { Sword, Heart, Shield, Medal, Trophy, Crown } as const

// Altura máxima del textarea antes de activar scroll interno (~10 líneas aprox.)
const TEXTAREA_MAX_HEIGHT = 260

export default function ReviewForm({ gameId, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating,      setRating]      = useState(existingReview?.rating  ?? 5)
  const [content,     setContent]     = useState(existingReview?.content ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,       setError]       = useState('')

  // Si ya existe una reseña, arrancamos en modo vista (bloqueado).
  // Si es una reseña nueva, arrancamos directamente en modo edición.
  const [isEditing, setIsEditing] = useState(!existingReview)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize con límite: crece con el contenido hasta TEXTAREA_MAX_HEIGHT,
  // a partir de ahí activa scroll interno en vez de seguir creciendo
  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)
    el.style.height = `${newHeight}px`
    el.style.overflowY = el.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden'
  }

  // Ajustar altura al montar (reseña existente) y cada vez que cambia el contenido
  useEffect(() => {
    if (isEditing) resizeTextarea()
  }, [content, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch(
        existingReview ? `/api/reviews/${existingReview.id}` : '/api/reviews',
        {
          method: existingReview ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, rating, content: content.trim() || null }),
        }
      )
      if (!res.ok) throw new Error()
      toast.success(existingReview ? 'Reseña actualizada correctamente' : 'Reseña publicada correctamente')
      setIsEditing(false)
      setTimeout(() => router.refresh(), 200)
    } catch {
      setError('Error al guardar la reseña. Inténtalo de nuevo.')
      toast.error('Error al guardar la reseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    if (!confirm('¿Eliminar tu reseña?')) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/reviews/${existingReview.id}`, { method: 'DELETE' })
      toast.success('Reseña eliminada correctamente')
      setTimeout(() => router.refresh(), 200)
    } catch {
      setError('Error al eliminar la reseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelEdit = () => {
    if (!existingReview) return
    setRating(existingReview.rating)
    setContent(existingReview.content ?? '')
    setError('')
    setIsEditing(false)
  }

  // ── MODO VISTA (reseña existente, sin editar) ──
  if (existingReview && !isEditing) {
    const { iconName, label } = getRatingData(existingReview.rating)
    const icon = ICON_MAP[iconName as keyof typeof ICON_MAP]

    return (
      <div className="space-y-5 w-full min-w-0">
        {error && (
          <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                          px-3 py-2.5 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Rating (solo lectura) */}
        <div className="min-w-0">
          <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-1.5">
            Tu puntuación
          </p>
          <div className="flex items-center gap-2">
            <PxlKitIcon icon={icon} size={18} />
            <span className="font-medium text-sm text-gn-text">{existingReview.rating}/10</span>
            <span className="text-xs text-gn-muted">{label}</span>
          </div>
        </div>

        {/* Contenido (solo lectura) */}
        <div className="min-w-0">
          <p className="text-gn-muted text-xs font-semibold uppercase tracking-widest mb-1.5">
            Reseña
          </p>
          {existingReview.content ? (
            <p className="text-gn-text text-sm leading-relaxed whitespace-pre-line break-words">
              {existingReview.content}
            </p>
          ) : (
            <p className="text-gn-subtle text-sm">Sin comentario</p>
          )}
        </div>

        {/* Botones */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-2 bg-gn-primary
                       hover:bg-gn-primary-dark text-white font-bold uppercase
                       tracking-wider text-sm py-3 rounded-lg shadow-gn-red
                       transition-all duration-200"
          >
            <PencilIcon className="w-4 h-4" />
            Editar reseña
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full border border-gn-primary/30 text-gn-primary
                       hover:bg-gn-primary/10 disabled:opacity-40 font-semibold
                       uppercase tracking-wider text-xs py-2.5 rounded-lg
                       transition-all duration-150"
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar reseña'}
          </button>
        </div>
      </div>
    )
  }

  // ── MODO EDICIÓN (reseña nueva, o existente en edición) ──
  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full min-w-0">

      {error && (
        <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                        px-3 py-2.5 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Rating gaming */}
      <RatingGaming value={rating} onChange={setRating} disabled={isSubmitting} />

      {/* Textarea */}
      <div className="min-w-0">
        <label className="block text-gn-muted text-xs font-semibold uppercase
                           tracking-widest mb-1.5">
          Reseña
        </label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          maxLength={1000}
          placeholder="Comparte tu experiencia..."
          style={{ maxHeight: `${TEXTAREA_MAX_HEIGHT}px` }}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                     px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-muted
                     focus:outline-none focus:border-gn-primary/40
                     focus:ring-1 focus:ring-gn-primary/20
                     disabled:opacity-40 resize-none transition-all"
        />
        <p className="text-gn-muted text-xs mt-1 text-right">
          {content.length}/1000
        </p>
      </div>

      {/* Botones */}
      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gn-primary hover:bg-gn-primary-dark disabled:opacity-40
                     text-white font-bold uppercase tracking-wider text-sm py-3
                     rounded-lg shadow-gn-red transition-all duration-200"
        >
          {isSubmitting ? '⏳ Guardando...'
            : existingReview ? '✏️ Actualizar reseña'
            : '▶ Publicar reseña'}
        </button>

        {existingReview ? (
          <button
            type="button"
            onClick={cancelEdit}
            disabled={isSubmitting}
            className="w-full border border-white/[0.06] text-gn-muted
                       hover:text-gn-text hover:border-white/15 disabled:opacity-40
                       font-semibold uppercase tracking-wider text-xs py-2.5
                       rounded-lg transition-all duration-150"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}