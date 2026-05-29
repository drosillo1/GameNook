import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { name } = await req.json()

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data:  { name: name.trim() },
  })

  return NextResponse.json({ name: updated.name })
}