import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import bcrypt from 'bcryptjs'
import { toUserResponse } from '../models/user.model'
import type { AppEnv } from '../types/hono-env'

export function createUserService(c: Context<AppEnv>) {
  const db = c.get('db')
  const storeId = c.get('storeId')

  return {
    async list(search: { q?: string; role?: 'admin' | 'operator' | 'viewer' }) {
      const rows = await db.user.findMany({
        where: {
          ...(storeId ? { storeId } : {}),
          ...(search.role ? { role: search.role } : {}),
          ...(search.q
            ? { OR: [{ name: { contains: search.q } }, { email: { contains: search.q } }] }
            : {}),
        },
      })
      return rows.map(toUserResponse)
    },

    async getById(id: number) {
      const row = await db.user.findUnique({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      return toUserResponse(row)
    },

    async create(data: {
      name: string
      email: string
      password: string
      role: 'admin' | 'operator' | 'viewer'
      storeId?: number
    }) {
      const existing = await db.user.findUnique({ where: { email: data.email } })
      if (existing) throw new HTTPException(409, { message: 'Email already in use' })

      if (data.storeId) {
        const store = await db.store.findUnique({ where: { id: data.storeId } })
        if (!store) throw new HTTPException(404, { message: 'Store not found' })
        if (!store.active) throw new HTTPException(422, { message: 'Store is inactive' })
      }

      const password = await bcrypt.hash(data.password, 10)
      const row = await db.user.create({ data: { ...data, password } })
      return toUserResponse(row)
    },

    async update(
      id: number,
      data: {
        name?: string
        email?: string
        password?: string
        role?: 'admin' | 'operator' | 'viewer'
        storeId?: number
      },
    ) {
      const row = await db.user.findUnique({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })

      if (data.role === 'admin') {
        throw new HTTPException(403, { message: 'Cannot promote to admin via update' })
      }

      const updateData = { ...data }
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10)
      }

      const updated = await db.user.update({ where: { id }, data: updateData })
      return toUserResponse(updated)
    },

    async remove(id: number) {
      const row = await db.user.findUnique({
        where: { id, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      await db.user.delete({ where: { id } })
      return toUserResponse(row)
    },
  }
}
