import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { toStoreResponse } from '../models/store.model'
import type { AppEnv } from '../types/hono-env'

function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function createStoreService(c: Context<AppEnv>) {
  const db = c.get('db')

  return {
    async list(search: { q?: string; active?: boolean }) {
      const rows = await db.store.findMany({
        where: {
          ...(search.active !== undefined ? { active: search.active } : {}),
          ...(search.q
            ? { OR: [{ name: { contains: search.q } }, { slug: { contains: search.q } }] }
            : {}),
        },
      })
      return rows.map(toStoreResponse)
    },

    async getById(id: number) {
      const row = await db.store.findUnique({ where: { id } })
      if (!row) throw new HTTPException(404, { message: 'Store not found' })
      return toStoreResponse(row)
    },

    async create(data: { name: string; address?: string; phone?: string; requireProductCode?: boolean }) {
      const slug = toSlug(data.name)
      const existing = await db.store.findUnique({ where: { slug } })
      if (existing) throw new HTTPException(409, { message: 'Slug already in use' })
      const row = await db.store.create({
        data: { ...data, slug, address: data.address || null, phone: data.phone || null },
      })
      return toStoreResponse(row)
    },

    async update(id: number, data: { name?: string; slug?: string; address?: string; phone?: string; requireProductCode?: boolean }) {
      const row = await db.store.findUnique({ where: { id } })
      if (!row) throw new HTTPException(404, { message: 'Store not found' })
      const { slug: _slug, ...safeData } = data
      const updated = await db.store.update({
        where: { id },
        data: {
          ...safeData,
          ...(safeData.address !== undefined && { address: safeData.address || null }),
          ...(safeData.phone !== undefined && { phone: safeData.phone || null }),
        },
      })
      return toStoreResponse(updated)
    },

    async remove(id: number) {
      const row = await db.store.findUnique({ where: { id } })
      if (!row) throw new HTTPException(404, { message: 'Store not found' })
      const updated = await db.store.update({ where: { id }, data: { active: false } })
      return toStoreResponse(updated)
    },
  }
}
