import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../types/hono-env'
import { Role } from '../enums'

export function requireRole(...roles: Array<Role>): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload) throw new HTTPException(401, { message: 'Unauthorized' })
    if (!roles.includes(jwtPayload.role)) throw new HTTPException(403, { message: 'Forbidden' })
    await next()
  }
}
