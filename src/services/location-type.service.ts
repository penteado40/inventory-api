import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { toLocationTypeResponse } from '../models/location-type.model'
import type { AppEnv } from '../types/hono-env'

export function createLocationTypeService(c: Context<AppEnv>) {
  const db = c.get('db')
  const storeId = c.get('storeId')

  return {
    async list(search: { q?: string }) {
      const rows = await db.locationType.findMany({
        where: {
          ...(storeId ? { storeId } : {}),
          ...(search.q ? { name: { contains: search.q } } : {}),
        },
      })
      return rows.map(toLocationTypeResponse)
    },

    async create(data: { name: string }) {
      if (!storeId) throw new HTTPException(400, { message: 'X-Store-Id header required' })

      const existing = await db.locationType.findFirst({
        where: { name: data.name, storeId },
      })
      if (existing) throw new HTTPException(409, { message: 'Location type already exists' })

      const row = await db.locationType.create({ data: { name: data.name, storeId } })
      return toLocationTypeResponse(row)
    },

    async update(id: number, data: { name?: string }) {
      const row = await db.locationType.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'Location type not found' })

      if (data.name) {
        const conflict = await db.locationType.findFirst({
          where: { name: data.name, storeId: row.storeId, NOT: { id } },
        })
        if (conflict) throw new HTTPException(409, { message: 'Location type already exists' })
      }

      const updated = await db.locationType.update({ where: { id }, data })
      return toLocationTypeResponse(updated)
    },

    async remove(id: number) {
      const row = await db.locationType.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'Location type not found' })

      const linked = await db.location.count({ where: { locationTypeId: id } })
      if (linked > 0) throw new HTTPException(409, { message: 'Location type has linked locations' })

      const deleted = await db.locationType.delete({ where: { id } })
      return toLocationTypeResponse(deleted)
    },
  }
}
