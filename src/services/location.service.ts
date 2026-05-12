import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { toLocationResponse, toLocationWithChildrenResponse } from '../models/location.model'
import type { AppEnv } from '../types/hono-env'

const includeLocationType = { locationType: true } as const
const includeWithChildren = {
  locationType: true,
  children: { include: { locationType: true } },
} as const

export function createLocationService(c: Context<AppEnv>) {
  const db = c.get('db')
  const storeId = c.get('storeId')

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

  return {
    async list(search: { locationTypeId?: number; parentId?: number; q?: string }) {
      const parsedQ = search.q ? parseInt(search.q, 10) : NaN
      const rows = await db.location.findMany({
        where: {
          ...(storeId ? { storeId } : {}),
          ...(search.locationTypeId ? { locationTypeId: search.locationTypeId } : {}),
          parentId: search.parentId ?? null,
          ...(search.q
            ? {
                OR: [
                  { locationType: { name: { contains: search.q } } },
                  ...(!isNaN(parsedQ) && parsedQ > 0 ? [{ number: parsedQ }] : []),
                ],
              }
            : {}),
        },
        include: includeWithChildren,
      })
      return rows.map(toLocationWithChildrenResponse)
    },

    async getById(id: number) {
      const row = await db.location.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
        include: includeWithChildren,
      })
      if (!row) throw new HTTPException(404, { message: 'Location not found' })
      return toLocationWithChildrenResponse(row)
    },

    async create(data: { number: number; locationTypeId: number; parentId?: number | null }) {
      if (!storeId) throw new HTTPException(400, { message: 'X-Store-Id header required' })

      const locType = await db.locationType.findFirst({
        where: { id: data.locationTypeId, ...(storeId ? { storeId } : {}) },
      })
      if (!locType) throw new HTTPException(404, { message: 'Location type not found' })

      if (data.parentId != null) {
        const parent = await db.location.findUnique({ where: { id: data.parentId } })
        if (!parent) throw new HTTPException(404, { message: 'Parent location not found' })
        if (parent.storeId !== storeId)
          throw new HTTPException(422, { message: 'Parent location belongs to another store' })
      }

      const conflict = await db.location.findFirst({
        where: {
          locationTypeId: data.locationTypeId,
          number: data.number,
          storeId,
          parentId: data.parentId ?? null,
        },
      })
      if (conflict) throw new HTTPException(409, { message: 'Location already exists' })

      const row = await db.location.create({
        data: {
          number: data.number,
          locationTypeId: data.locationTypeId,
          parentId: data.parentId ?? null,
          storeId,
        },
        include: includeLocationType,
      })
      return toLocationResponse(row)
    },

    async update(id: number, data: { number?: number; locationTypeId?: number; parentId?: number | null }) {
      const current = await db.location.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
        include: includeLocationType,
      })
      if (!current) throw new HTTPException(404, { message: 'Location not found' })

      if (data.locationTypeId !== undefined) {
        const locType = await db.locationType.findFirst({
          where: { id: data.locationTypeId, ...(storeId ? { storeId } : {}) },
        })
        if (!locType) throw new HTTPException(404, { message: 'Location type not found' })
      }

      if (data.parentId !== undefined && data.parentId != null) {
        if (data.parentId === id)
          throw new HTTPException(422, { message: 'Circular location reference' })

        const parent = await db.location.findUnique({ where: { id: data.parentId } })
        if (!parent) throw new HTTPException(404, { message: 'Parent location not found' })
        if (parent.storeId !== current.storeId)
          throw new HTTPException(422, { message: 'Parent location belongs to another store' })

        if (await wouldCreateCycle(data.parentId, id))
          throw new HTTPException(422, { message: 'Circular location reference' })
      }

      const newNumber = data.number ?? current.number
      const newLocationTypeId = data.locationTypeId ?? current.locationTypeId
      const newParentId = data.parentId !== undefined ? data.parentId : current.parentId

      const conflict = await db.location.findFirst({
        where: {
          locationTypeId: newLocationTypeId,
          number: newNumber,
          storeId: current.storeId,
          parentId: newParentId,
          NOT: { id },
        },
      })
      if (conflict) throw new HTTPException(409, { message: 'Location already exists' })

      const updated = await db.location.update({
        where: { id },
        data,
        include: includeLocationType,
      })
      return toLocationResponse(updated)
    },

    async remove(id: number) {
      const row = await db.location.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
        include: includeLocationType,
      })
      if (!row) throw new HTTPException(404, { message: 'Location not found' })

      // TODO: check products when Product module is implemented
      // const allocatedProducts = await db.product.count({ where: { locationId: id } })
      // if (allocatedProducts > 0) throw new HTTPException(409, { message: 'Location has allocated products' })

      const children = await db.location.count({ where: { parentId: id } })
      if (children > 0) throw new HTTPException(409, { message: 'Location has children' })

      await db.location.delete({ where: { id } })
      return toLocationResponse(row)
    },
  }
}
