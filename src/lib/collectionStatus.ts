// src/lib/collectionStatus.ts
import 'server-only'
import { prisma } from '@/lib/prisma'
import type { CollectionStatus } from '@prisma/client'


export type CollectionStatusMap = Record<string, CollectionStatus>


export async function getCollectionStatuses(
  userId:  string | null | undefined,
  gameIds: string[],
): Promise<CollectionStatusMap> {
  if (!userId || gameIds.length === 0) return {}

  try {
    const entries = await prisma.gameCollection.findMany({
      where:  { userId, gameId: { in: gameIds } },
      select: { gameId: true, status: true },
    })

    const map: CollectionStatusMap = {}
    for (const entry of entries) {
      map[entry.gameId] = entry.status
    }
    return map
  } catch (error) {

    console.error('Error cargando estados de colección:', error)
    return {}
  }
}