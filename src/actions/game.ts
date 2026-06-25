'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Esquema de validación para actualizar un juego
const GameUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  releaseDate: z.string().nullable().optional(), // ISO date string
  genre: z.array(z.string()).optional(),
  platform: z.array(z.string()).optional(),
  igdbId: z.number().int().nullable().optional(),
})

export type GameUpdate = z.infer<typeof GameUpdateSchema>

async function requireAdminOrModerator() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    throw new Error('No autorizado')
  }
  return session
}

export async function updateGameAction(gameId: string, slug: string, formData: unknown) {
  await requireAdminOrModerator()

  const data = GameUpdateSchema.parse(formData)

  const prismaData: any = {}
  if (data.title !== undefined) prismaData.title = data.title
  if (data.description !== undefined) prismaData.description = data.description
  if (data.imageUrl !== undefined) prismaData.imageUrl = data.imageUrl
  if (data.releaseDate) prismaData.releaseDate = new Date(data.releaseDate)
  if (data.genre) prismaData.genre = data.genre
  if (data.platform) prismaData.platform = data.platform
  if (data.igdbId !== undefined) prismaData.igdbId = data.igdbId

  const updated = await prisma.game.update({ where: { id: gameId }, data: prismaData })

  try {
    revalidateTag(`game-${slug}`)
    revalidatePath('/games')
    revalidatePath('/admin')
  } catch (err) {
    console.error('revalidate failed', err)
  }

  return updated
}

export async function createGameAction(formData: unknown) {
  await requireAdminOrModerator()

  // Simple create example with minimal fields validated
  const CreateSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
  })

  const data = CreateSchema.parse(formData)
  const created = await prisma.game.create({ data })

  try {
    revalidateTag(`game-${created.slug}`)
    revalidatePath('/games')
  } catch (err) {
    console.error('revalidate failed', err)
  }

  return created
}