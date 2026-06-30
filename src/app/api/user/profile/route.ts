// src/app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidFavoritePlatform, MAX_FAVORITE_PLATFORMS } from '@/lib/platforms'
import { isValidAvatar } from '@/lib/avatars'

const BIO_MAX_LENGTH = 160
const LOCATION_MAX_LENGTH = 50

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, location: true, favoritePlatforms: true, avatar: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, bio, location, favoritePlatforms, avatar } = body

  const data: {
    name?: string
    bio?: string | null
    location?: string | null
    favoritePlatforms?: string[]
    avatar?: string | null
  } = {}

  // name: igual que en /api/user/name, sin restricción de unicidad
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    }
    data.name = name.trim()
  }

  // bio: opcional, máx 160 caracteres
  if (bio !== undefined) {
    if (bio !== null && typeof bio !== 'string') {
      return NextResponse.json({ error: 'Bio inválida' }, { status: 400 })
    }
    const trimmedBio = bio?.trim() || null
    if (trimmedBio && trimmedBio.length > BIO_MAX_LENGTH) {
      return NextResponse.json(
        { error: `La bio no puede superar los ${BIO_MAX_LENGTH} caracteres` },
        { status: 400 }
      )
    }
    data.bio = trimmedBio
  }

  // location: opcional, máx 50 caracteres
  if (location !== undefined) {
    if (location !== null && typeof location !== 'string') {
      return NextResponse.json({ error: 'Ubicación inválida' }, { status: 400 })
    }
    const trimmedLocation = location?.trim() || null
    if (trimmedLocation && trimmedLocation.length > LOCATION_MAX_LENGTH) {
      return NextResponse.json(
        { error: `La ubicación no puede superar los ${LOCATION_MAX_LENGTH} caracteres` },
        { status: 400 }
      )
    }
    data.location = trimmedLocation
  }

  // favoritePlatforms: opcional, array de hasta MAX_FAVORITE_PLATFORMS valores válidos
  if (favoritePlatforms !== undefined) {
    if (!Array.isArray(favoritePlatforms)) {
      return NextResponse.json({ error: 'Formato de plataformas inválido' }, { status: 400 })
    }
    if (favoritePlatforms.length > MAX_FAVORITE_PLATFORMS) {
      return NextResponse.json(
        { error: `Puedes elegir como máximo ${MAX_FAVORITE_PLATFORMS} plataformas` },
        { status: 400 }
      )
    }
    const invalid = favoritePlatforms.find(p => typeof p !== 'string' || !isValidFavoritePlatform(p))
    if (invalid !== undefined) {
      return NextResponse.json({ error: 'Plataforma no reconocida' }, { status: 400 })
    }
    data.favoritePlatforms = favoritePlatforms
  }

  // avatar: opcional, null para quitar o string con id válido del catálogo
  if (avatar !== undefined) {
    if (avatar === null) {
      data.avatar = null
    } else if (typeof avatar !== 'string' || !isValidAvatar(avatar)) {
      return NextResponse.json({ error: 'Avatar no reconocido' }, { status: 400 })
    } else {
      data.avatar = avatar
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { name: true, bio: true, location: true, favoritePlatforms: true, avatar: true },
  })

  return NextResponse.json(updated)
}