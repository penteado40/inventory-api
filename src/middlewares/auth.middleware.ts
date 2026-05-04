import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../types/hono-env'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authorization = c.req.header('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing token' })
  }

  const token = authorization.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) throw new HTTPException(500, { message: 'Internal Server Error' })

  let payload: Record<string, unknown>
  try {
    payload = await verify(token, secret, 'HS256')
  } catch (err) {
    if (err instanceof Error && err.name === 'JwtTokenExpiredException') {
      throw new HTTPException(401, { message: 'Token expired' })
    }
    throw new HTTPException(401, { message: 'Invalid token' })
  }

  const role = payload.role as 'admin' | 'operator' | 'viewer'
  const storeId = (payload.storeId ?? null) as number | null

  if (storeId == null && role !== 'admin') {
    throw new HTTPException(401, { message: 'Token missing store context' })
  }

  c.set('jwtPayload', { sub: payload.sub as number, role, storeId })

  await next()
})
