import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../types/hono-env'
import { Role } from '../enums'

export const storeContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const { role, storeId: tokenStoreId } = c.get('jwtPayload')

  if (role === Role.operator || role === Role.viewer) {
    c.set('storeId', tokenStoreId)
    return await next()
  }

  // admin: resolve storeId from X-Store-Id header or fall back to global view
  const headerValue = c.req.header('X-Store-Id')
  if (!headerValue) {
    c.set('storeId', null)
    return await next()
  }

  const id = Number(headerValue)
  if (!Number.isInteger(id) || id <= 0) {
    throw new HTTPException(400, { message: 'Invalid X-Store-Id header' })
  }

  const db = c.get('db')
  const store = await db.store.findUnique({ where: { id } })
  if (!store) throw new HTTPException(404, { message: 'Store not found' })
  if (!store.active) throw new HTTPException(422, { message: 'Store is inactive' })

  c.set('storeId', id)
  await next()
})
