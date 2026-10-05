// src/components/RecentReviews.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import UserAvatarDisplay from './UserAvatarDisplay'
import { getRatingData } from '@/lib/rating'

const LOOP_DURATION_S             = 40   
const RESUME_AFTER_INTERACTION_MS = 4000  
const CARD_GAP_PX                 = 16    

const RATING_EMOJI: Record<string, string> = {
  Sword:  '🗡️',
  Heart:  '❤️',
  Shield: '🛡️',
  Medal:  '🎖️',
  Trophy: '🏆',
  Crown:  '👑',
}

interface Review {
  id:      string
  rating:  number
  content: string | null
  game: {
    title:    string
    slug:     string
    imageUrl: string | null
  }
  user: {
    name:   string | null
    image:  string | null
    avatar: string | null
  }
}

interface Props {
  reviews: Review[]
}

function ReviewCard({
  review,
  priority,
  duplicate,
}: {
  review:    Review
  priority:  boolean
  duplicate: boolean
}) {
  const meta = getRatingData(review.rating)

  return (
    <Link
      href={`/games/${review.game.slug}`}
      // La copia del bucle infinito es solo visual: fuera del árbol de
      // accesibilidad y del orden de tabulación, o se leería todo dos veces.
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="flex-shrink-0 w-72 bg-gn-card border border-white/[0.06]
                 rounded-xl overflow-hidden hover:border-gn-primary/25
                 hover:-translate-y-1 transition-all duration-200 block"
    >
      {/* Imagen del juego */}
      <div className="relative h-32 bg-gn-surface overflow-hidden">
        {review.game.imageUrl ? (
          <Image
            src={review.game.imageUrl}
            alt={duplicate ? '' : review.game.title}
            fill
            className="object-cover"
            sizes="288px"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gn-card/90 to-transparent z-10" />
        <p
          className="absolute bottom-2 left-3 right-3 font-display font-bold
                     text-xs text-gn-text truncate z-20"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {review.game.title}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserAvatarDisplay
              avatar={review.user.avatar}
              image={review.user.image}
              name={review.user.name}
              size={28}
            />
            <span className="text-gn-muted text-xs font-semibold truncate max-w-[90px]">
              {review.user.name ?? 'Gamer'}
            </span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold"
            style={{
              background:  `${meta.color}18`,
              borderColor: `${meta.color}40`,
              color:        meta.color,
            }}
            title={meta.label}
          >
            <span aria-hidden="true">{RATING_EMOJI[meta.iconName] ?? '🎮'}</span>
            <span style={{ fontFamily: 'Orbitron, monospace' }}>{review.rating}</span>
            <span className="sr-only">— {meta.label}</span>
          </div>
        </div>

        {review.content ? (
          <p className="text-gn-muted text-xs leading-relaxed line-clamp-3">
            "{review.content}"
          </p>
        ) : (
          <p className="text-gn-subtle text-xs italic">Sin comentario</p>
        )}
      </div>
    </Link>
  )
}

function isAtEnd(track: HTMLDivElement) {
  return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
}

export default function RecentReviews({ reviews }: Props) {
  const trackRef           = useRef<HTMLDivElement>(null)
  const hoverRef           = useRef(false)   // ratón encima
  const focusRef           = useRef(false)   // foco de teclado dentro
  const lastInteractionRef = useRef(0)       // último gesto manual
  const periodRef          = useRef(0)       // ancho de una copia de la lista, en px

  // Conservador hasta montar: sin autoplay (ni lista duplicada) hasta conocer
  // la preferencia de movimiento del usuario.
  const [autoplay, setAutoplay] = useState(false)
  const [canPrev,  setCanPrev]  = useState(false)
  const [canNext,  setCanNext]  = useState(true)

  useEffect(() => {
    const mq     = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAutoplay(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Distancia exacta entre una tarjeta y su copia: es el punto en el que el
  // bucle puede saltar atrás sin que se note. Medido en el DOM en vez de
  // scrollWidth / 2, que incluye el padding del track y daría un salto visible.
  const measurePeriod = useCallback(() => {
    const track = trackRef.current
    if (!track || !autoplay) { periodRef.current = 0; return }
    const first = track.children[0]              as HTMLElement | undefined
    const copy  = track.children[reviews.length] as HTMLElement | undefined
    periodRef.current = first && copy ? copy.offsetLeft - first.offsetLeft : 0
  }, [autoplay, reviews.length])

  const updateArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanPrev(track.scrollLeft > 4)
    setCanNext(!isAtEnd(track))
  }, [])

  useEffect(() => {
    measurePeriod()
    updateArrows()
    const onResize = () => { measurePeriod(); updateArrows() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measurePeriod, updateArrows])

  const markInteraction = () => {
    lastInteractionRef.current = Date.now()
  }

  const scrollByCards = (dir: 1 | -1) => {
    markInteraction()
    const card = trackRef.current?.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + CARD_GAP_PX : 304
    trackRef.current?.scrollBy({
      left:     dir * step,
      behavior: autoplay ? 'smooth' : 'auto',
    })
  }

  // Desplazamiento continuo sobre scrollLeft (no transform), para que el swipe
  // del usuario y la animación muevan lo mismo. Basado en tiempo, no en
  // fotogramas, para ir igual de rápido en pantallas de 60 y 120 Hz.
  useEffect(() => {
    if (!autoplay) return
    const track = trackRef.current
    if (!track) return

    let raf  = 0
    let last = performance.now()
    let pos  = track.scrollLeft   // acumulador con decimales: scrollLeft puede redondear

    const tick = (now: number) => {
      // Tope de 100 ms: al volver de una pestaña en segundo plano, no dar un salto.
      const dt = Math.min(now - last, 100) / 1000
      last = now

      const period = periodRef.current
      const idle =
        !hoverRef.current &&
        !focusRef.current &&
        Date.now() - lastInteractionRef.current > RESUME_AFTER_INTERACTION_MS

      // Si una copia de la lista no llena la pantalla (pocas reseñas en un
      // monitor ancho), el bucle no puede cerrar: mejor quieto que atascado.
      if (idle && period > 0 && period >= track.clientWidth) {
        // Si el usuario lo movió, retomar desde donde lo dejó.
        if (Math.abs(track.scrollLeft - pos) > 2) pos = track.scrollLeft
        pos += (period / LOOP_DURATION_S) * dt
        if (pos >= period) pos -= period   // salto invisible: la copia es idéntica
        track.scrollLeft = pos
      } else {
        pos = track.scrollLeft
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoplay])

  // Solo se duplica cuando hay animación: sin movimiento no hace falta bucle.
  const items = autoplay
    ? [
        ...reviews.map(r => ({ review: r, duplicate: false })),
        ...reviews.map(r => ({ review: r, duplicate: true  })),
      ]
    : reviews.map(r => ({ review: r, duplicate: false }))

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Últimas reseñas de la comunidad"
    >
      {/* Degradados de borde — solo cuando hay contenido oculto hacia ese lado */}
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 md:w-24
                    bg-gradient-to-r from-gn-bg to-transparent transition-opacity duration-300
                    ${canPrev ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 md:w-24
                    bg-gradient-to-l from-gn-bg to-transparent transition-opacity duration-300
                    ${canNext ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Flechas — solo desktop; en móvil el gesto natural es deslizar */}
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        disabled={!canPrev}
        aria-label="Reseñas anteriores"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 items-center justify-center rounded-full
                   bg-gn-card/90 backdrop-blur border border-white/[0.08] text-gn-text
                   hover:border-gn-primary/40 transition-all duration-200
                   disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCards(1)}
        disabled={!canNext}
        aria-label="Reseñas siguientes"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 items-center justify-center rounded-full
                   bg-gn-card/90 backdrop-blur border border-white/[0.08] text-gn-text
                   hover:border-gn-primary/40 transition-all duration-200
                   disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Track — sin scroll-snap: con desplazamiento continuo, el snap intentaría
          encajar cada fotograma. py-2 deja sitio al hover:-translate-y-1 de las
          cards, que el overflow-x-auto recortaría. */}
      <div
        ref={trackRef}
        onScroll={updateArrows}
        onPointerEnter={e => { if (e.pointerType === 'mouse') hoverRef.current = true }}
        onPointerLeave={e => { if (e.pointerType === 'mouse') hoverRef.current = false }}
        onPointerDown={markInteraction}
        onTouchStart={markInteraction}
        onTouchMove={markInteraction}
        onWheel={markInteraction}
        onFocus={() => { focusRef.current = true }}
        onBlur={() => { focusRef.current = false }}
        className="flex gap-4 overflow-x-auto px-6 py-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ review, duplicate }, i) => (
          <ReviewCard
            key={`${review.id}-${duplicate ? 'b' : 'a'}`}
            review={review}
            priority={i < 2}
            duplicate={duplicate}
          />
        ))}
      </div>
    </div>
  )
}