// src/lib/rateLimit.ts
import { NextResponse } from 'next/server'

/**
 * Rate limiter en memoria — ventana deslizante simple.
 *
 * IMPLEMENTACIÓN DELIBERADAMENTE PROVISIONAL. En Vercel cada instancia
 * serverless tiene su propio Map, así que el límite efectivo es
 * `limit × nº de instancias activas`, y se resetea en cada cold start.
 * Para el volumen actual (decenas de usuarios) es más que suficiente:
 * frena el bucle accidental y el script tonto, que es el 99% del abuso real.
 *
 * MIGRACIÓN A UPSTASH: reimplementar el cuerpo de `rateLimit()` y borrar el
 * Map. Los call sites NO cambian — por eso la función es `async` aunque aquí
 * no lo necesite, y por eso la firma (key, limit, windowSeconds) es la misma
 * que usa Upstash. El estado es desechable: no hay nada que migrar.
 */

// Sobrevive al hot reload en desarrollo, igual que el cliente de Prisma.
const globalForRateLimit = globalThis as unknown as {
  rateLimitBuckets:   Map<string, number[]> | undefined
  rateLimitLastSweep: number | undefined
}

const buckets = globalForRateLimit.rateLimitBuckets ?? new Map<string, number[]>()
globalForRateLimit.rateLimitBuckets = buckets

const SWEEP_INTERVAL_MS = 5 * 60 * 1000
const MAX_TRACKED_KEYS  = 10_000

/**
 * Límites centralizados. Están puestos a ojo porque todavía no hay datos de
 * uso real — cuando los haya, se ajustan AQUÍ y en ningún otro sitio.
 * Son generosos a propósito: es preferible dejar pasar a un usuario intenso
 * que bloquear a uno legítimo.
 */
export const RATE_LIMITS = {
  // 10 altas de juego al día. Una persona metiendo su colección a mano no
  // pasa de aquí en una tarde normal; un script sí, al instante.
  GAME_CREATE:      { limit: 10, windowSeconds: 24 * 60 * 60 },
  // Escrituras en colección: cambiar de estado es barato y frecuente.
  COLLECTION_WRITE: { limit: 60, windowSeconds: 60 },
  // Reseñas: escribir una lleva tiempo, 20 en 5 min ya es anómalo.
  REVIEW_WRITE:     { limit: 20, windowSeconds: 5 * 60 },
  // Likes: un click por like, pero permite navegar rápido por una lista.
  REVIEW_LIKE:      { limit: 60, windowSeconds: 60 },
} as const

export interface RateLimitResult {
  ok:                 boolean
  remaining:          number
  retryAfterSeconds:  number
}

/** Limpieza periódica: sin esto el Map crece indefinidamente. */
function sweep(now: number) {
  const last = globalForRateLimit.rateLimitLastSweep ?? 0
  if (now - last < SWEEP_INTERVAL_MS && buckets.size < MAX_TRACKED_KEYS) return

  globalForRateLimit.rateLimitLastSweep = now

  // Una entrada sin timestamps dentro de la ventana más larga ya no sirve.
  const maxWindowMs = Math.max(
    ...Object.values(RATE_LIMITS).map(r => r.windowSeconds)
  ) * 1000

  for (const [key, timestamps] of buckets) {
    const alive = timestamps.filter(t => now - t < maxWindowMs)
    if (alive.length === 0) buckets.delete(key)
    else buckets.set(key, alive)
  }
}

/**
 * Registra un intento y dice si se puede continuar.
 * Devuelve `ok: false` cuando se ha superado el límite en la ventana.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now      = Date.now()
  const windowMs = windowSeconds * 1000

  sweep(now)

  const previous = buckets.get(key) ?? []
  const inWindow = previous.filter(t => now - t < windowMs)

  if (inWindow.length >= limit) {
    // El hueco se libera cuando caduca el intento más antiguo de la ventana.
    const oldest     = Math.min(...inWindow)
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    buckets.set(key, inWindow)
    return { ok: false, remaining: 0, retryAfterSeconds: retryAfter }
  }

  inWindow.push(now)
  buckets.set(key, inWindow)

  return {
    ok:                true,
    remaining:         limit - inWindow.length,
    retryAfterSeconds: 0,
  }
}

/** Respuesta 429 estándar, para no repetirla en cada ruta. */
export function rateLimitResponse(result: RateLimitResult, message?: string) {
  return NextResponse.json(
    {
      error: message ?? 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
      retryAfter: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    }
  )
}

/** Normaliza `limit`/`offset` de query params: tope máximo y NaN controlado. */
export function parsePagination(
  limitParam: string | null,
  offsetParam: string | null,
  { defaultLimit = 50, maxLimit = 100 } = {}
) {
  const rawLimit  = parseInt(limitParam  ?? '', 10)
  const rawOffset = parseInt(offsetParam ?? '', 10)

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), maxLimit)
    : defaultLimit

  const offset = Number.isFinite(rawOffset) && rawOffset > 0
    ? Math.min(rawOffset, 10_000)
    : 0

  return { limit, offset }
}