// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para generar slug desde título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales con guiones
    .replace(/(^-|-$)/g, '')         // Quitar guiones al inicio y final
}

// Función para asegurar slug único
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existingGame = await prisma.game.findUnique({
      where: { slug }
    })
    
    if (!existingGame) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// GET - Obtener todos los juegos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = search ? {
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          genre: {
            hasSome: [search],
          },
        },
      ],
    } : {}

    const games = await prisma.game.findMany({
      where,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      take: limit,
      skip: offset,
    })

    // Calcular rating promedio
    const gamesWithRating = games.map(game => ({
      ...game,
      averageRating: game.reviews.length > 0 
        ? game.reviews.reduce((sum, review) => sum + review.rating, 0) / game.reviews.length
        : null,
    }))

    return NextResponse.json(gamesWithRating)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo juego
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, imageUrl, releaseDate, genre, platform } = body

    // Validaciones
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un juego con el mismo título
    const existingGame = await prisma.game.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: 'insensitive',
        },
      },
    })

    if (existingGame) {
      return NextResponse.json(
        { error: 'Ya existe un juego con ese título' },
        { status: 400 }
      )
    }

    // Generar slug único
    const baseSlug = generateSlug(title.trim())
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // Preparar datos para crear el juego
    const gameData = {
      title: title.trim(),
      slug: uniqueSlug,
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      genre: Array.isArray(genre) ? genre.filter(g => g && g.trim()) : [],
      platform: Array.isArray(platform) ? platform.filter(p => p && p.trim()) : [],
    }

    // Crear el juego
    const game = await prisma.game.create({
      data: gameData,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    // Agregar rating promedio (será null para juego nuevo)
    const gameWithRating = {
      ...game,
      averageRating: null,
    }

    return NextResponse.json(gameWithRating, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}