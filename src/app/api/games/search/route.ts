// src/app/api/games/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveGameAlias } from '@/lib/gameAliases'

// Búsqueda ligera para el dropdown de autocompletado 

const MAX_QUERY_LENGTH = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // El slice evita que una cadena de 100k caracteres dispare similarity()
    // contra todo el catálogo.
    const q = searchParams.get('q')?.trim().slice(0, MAX_QUERY_LENGTH)

    if (!q || q.length < 2) {
      return NextResponse.json({ games: [] })
    }

    // Términos extra por alias (ej. "gta" -> "grand theft auto").
    // Se añaden como OR adicional, nunca sustituyen el término original.
    const aliasTerms = resolveGameAlias(q)
    const allTerms = [q, ...aliasTerms]

    // similarity() de pg_trgm devuelve 0-1. 0.3 es un umbral razonable:
    // suficiente para "resindet" ~ "resident" sin traer ruido excesivo.
    const SIMILARITY_THRESHOLD = 0.3

    const games = await prisma.$queryRaw<Array<{
      id: string
      title: string
      slug: string
      imageUrl: string | null
      releaseDate: Date | null
    }>>`
      SELECT id, title, slug, "imageUrl", "releaseDate"
      FROM "Game"
      WHERE status = 'APPROVED'
        AND (
          ${q} = ANY(genre)
          OR EXISTS (
            SELECT 1 FROM unnest(${allTerms}::text[]) AS term
            WHERE title ILIKE '%' || term || '%'
               OR similarity(title, term) > ${SIMILARITY_THRESHOLD}
          )
        )
      ORDER BY "popularityScore" DESC
      LIMIT 8
    `

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error searching games:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}