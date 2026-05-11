import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import bcrypt from 'bcryptjs'
import { toUserResponse } from '../models/user.model'
import type { AppEnv } from '../types/hono-env'

export function createUserService(c: Context<AppEnv>) {
  const db = c.get('db')
  const storeId = c.get('storeId')

  return {
    async list(search: { q?: string; role?: 'admin' | 'operator' | 'viewer'; active?: boolean }) {
      const rows = await db.user.findMany({
        where: {
          active: search.active,
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
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
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
      phone?: string
    }) {
      const existing = await db.user.findUnique({ where: { email: data.email } })
      if (existing) throw new HTTPException(409, { message: 'Email already in use' })

      if (data.storeId) {
        const store = await db.store.findUnique({ where: { id: data.storeId } })
        if (!store) throw new HTTPException(404, { message: 'Store not found' })
        if (!store.active) throw new HTTPException(422, { message: 'Store is inactive' })
      }

      const password = await bcrypt.hash(data.password, 10)
      const row = await db.user.create({
        data: { ...data, password, phone: data.phone || null },
      })
      return toUserResponse(row)
    },

    async update(id: number, data: { name?: string; phone?: string }) {
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      const updated = await db.user.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
      })
      return toUserResponse(updated)
    },

    async resetPassword(id: number, password: string) {
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      const hashed = await bcrypt.hash(password, 10)
      const updated = await db.user.update({ where: { id }, data: { password: hashed } })
      return toUserResponse(updated)
    },

    async changeRole(id: number, role: 'admin' | 'operator' | 'viewer') {
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      const updated = await db.user.update({ where: { id }, data: { role } })
      return toUserResponse(updated)
    },

    async changeStore(id: number, newStoreId: number | null) {
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      if (newStoreId !== null) {
        const store = await db.store.findUnique({ where: { id: newStoreId } })
        if (!store) throw new HTTPException(404, { message: 'Store not found' })
        if (!store.active) throw new HTTPException(422, { message: 'Store is inactive' })
      }
      const updated = await db.user.update({ where: { id }, data: { storeId: newStoreId } })
      return toUserResponse(updated)
    },

    async remove(id: number) {
      const row = await db.user.findFirst({
        where: { id, active: true, ...(storeId ? { storeId } : {}) },
      })
      if (!row) throw new HTTPException(404, { message: 'User not found' })
      const updated = await db.user.update({ where: { id }, data: { active: false } })
      return toUserResponse(updated)
    },
  }
}
