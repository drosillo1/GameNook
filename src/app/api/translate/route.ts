// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { translateToSpanish } from '@/lib/translate'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

// Proxy de traducción

const TEXT_MAX_LENGTH = 2000


const TRANSLATE_LIMIT = { limit: 20, windowSeconds: 5 * 60 }

export async function POST(request: NextRequest) {
  try {
    // Requiere sesión
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rl = await rateLimit(
      `translate:${session.user.id}`,
      TRANSLATE_LIMIT.limit,
      TRANSLATE_LIMIT.windowSeconds
    )
    if (!rl.ok) {
      return rateLimitResponse(rl, 'Demasiadas traducciones seguidas. Espera un momento.')
    }

    const { text } = await request.json()

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto inválido' }, { status: 400 })
    }

    if (!text.trim()) {
      return NextResponse.json({ translated: '' })
    }

    if (text.length > TEXT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `El texto no puede superar los ${TEXT_MAX_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    const translated = await translateToSpanish(text)

    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Error translating:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}