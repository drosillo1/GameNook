// src/components/ReviewForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RatingGaming from './RatingGaming'

interface ReviewFormProps {
  gameId: string
  existingReview?: { id: string; rating: number; content: string | null } | null
}

export default function ReviewForm({ gameId, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating,      setRating]      = useState(existingReview?.rating  ?? 5)
  const [content,     setContent]     = useState(existingReview?.content ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch(
        existingReview ? `/api/reviews/${existingReview.id}` : '/api/reviews',
        {
          method:  existingReview ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ gameId, rating, content: content.trim() || null }),
        }
      )
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError('Error al guardar la reseña. Inténtalo de nuevo.')
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
      router.refresh()
    } catch {
      setError('Error al eliminar la reseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="bg-gn-primary/10 border border-gn-primary/30 text-red-300
                        px-3 py-2.5 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Rating gaming */}
      <RatingGaming value={rating} onChange={setRating} disabled={isSubmitting} />

      {/* Textarea */}
      <div>
        <label className="block text-gn-muted text-xs font-semibold uppercase
                           tracking-widest mb-1.5">
          Reseña
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          maxLength={1000}
          placeholder="Comparte tu experiencia..."
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

        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full border border-gn-primary/30 text-gn-primary
                       hover:bg-gn-primary/10 disabled:opacity-40 font-semibold
                       uppercase tracking-wider text-xs py-2.5 rounded-lg
                       transition-all duration-150"
          >
            Eliminar reseña
          </button>
        )}
      </div>
    </form>
  )
}