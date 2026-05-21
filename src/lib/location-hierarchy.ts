import type { PrismaClient } from '@prisma/client'
import { HTTPException } from 'hono/http-exception'

export function createLocationHierarchy(db: PrismaClient) {
  async function wouldCreateCycle(startId: number, forbiddenId: number): Promise<boolean> {
    let current: number | null = startId
    while (current !== null) {
      if (current === forbiddenId) return true
      const loc: { parentId: number | null } | null = await db.location.findUnique({
        where: { id: current },
        select: { parentId: true },
      })
      current = loc?.parentId ?? null
    }
    return false
  }

  async function validateParent(parentId: number, storeId: number): Promise<void> {
    const parent = await db.location.findUnique({ where: { id: parentId } })
    if (!parent) throw new HTTPException(404, { message: 'Parent location not found' })
    if (parent.storeId !== storeId)
      throw new HTTPException(422, { message: 'Parent location belongs to another store' })
  }

  return { wouldCreateCycle, validateParent }
}
