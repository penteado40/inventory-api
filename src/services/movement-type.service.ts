import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { toMovementTypeResponse } from '../models/movement-type.model'
import type { AppEnv } from '../types/hono-env'
import { Behavior } from '../enums'

export function createMovementTypeService(c: Context<AppEnv>) {
  const db = c.get('db')
  const storeId = c.get('storeId')

  return {
    async list(search: { behavior?: Behavior; q?: string }) {
      const rows = await db.movementType.findMany({
        where: {
          ...(storeId ? { storeId } : {}),
          ...(search.behavior ? { behavior: search.behavior } : {}),
          ...(search.q ? { name: { contains: search.q } } : {}),
        },
      })
      return rows.map(toMovementTypeResponse)
    },

    async create(data: { name: string; behavior: Behavior }) {
      if (!storeId) throw new HTTPException(400, { message: 'X-Store-Id header required' })

      const existing = await db.movementType.findFirst({
        where: { name: data.name, storeId },
      })
      if (existing) throw new HTTPException(409, { message: 'Movement type already exists' })

      const row = await db.movementType.create({ data: { ...data, storeId } })
      return toMovementTypeResponse(row)
    },

    async update(id: number, data: { name?: string }) {
      const row = await db.movementType.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'Movement type not found' })

      if (data.name) {
        const conflict = await db.movementType.findFirst({
          where: { name: data.name, storeId: row.storeId, NOT: { id } },
        })
        if (conflict) throw new HTTPException(409, { message: 'Movement type already exists' })
      }

      const updated = await db.movementType.update({ where: { id }, data })
      return toMovementTypeResponse(updated)
    },

    async remove(id: number) {
      const row = await db.movementType.findFirst({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'Movement type not found' })

      // TODO: check movements when Movement module is implemented
      // const linked = await db.movement.count({ where: { movementTypeId: id } })
      // if (linked > 0) throw new HTTPException(409, { message: 'Movement type has linked movements' })

      const deleted = await db.movementType.delete({ where: { id } })
      return toMovementTypeResponse(deleted)
    },
  }
}
