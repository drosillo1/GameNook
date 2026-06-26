// src/app/api/user/username/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidUsername, getUsernameValidationError } from '@/lib/username'

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const username = (body.username ?? '').toString().trim().toLowerCase()

  const validationError = getUsernameValidationError(username)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  // El username es fijo una vez elegido — si ya lo tiene, no se puede cambiar
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  if (currentUser?.username) {
    return NextResponse.json(
      { error: 'Ya tienes un nombre de usuario asignado y no se puede cambiar' },
      { status: 409 }
    )
  }

  // Comprobar unicidad
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { username },
  })

  return NextResponse.json({ username })
}