import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { toUserResponse } from '../models/user.model'
import type { ServiceDeps } from '../types/hono-env'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new HTTPException(500, { message: 'Internal Server Error' })
  return secret
}

function accessTokenPayload(sub: number, role: string, storeId: number | null) {
  const now = Math.floor(Date.now() / 1000)
  // admin always gets storeId: null in the token — store context via X-Store-Id header
  const tokenStoreId = role === 'admin' ? null : storeId
  return { sub, role, storeId: tokenStoreId, iat: now, exp: now + 15 * 60 }
}

function refreshTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}

export function createAuthService({ db }: ServiceDeps) {
  const secret = getSecret()

  return {
    async login(data: { email: string; password: string }) {
      const user = await db.user.findUnique({ where: { email: data.email } })
      if (!user) throw new HTTPException(401, { message: 'Invalid credentials' })

      const valid = await bcrypt.compare(data.password, user.password)
      if (!valid) throw new HTTPException(401, { message: 'Invalid credentials' })

      const accessToken = await sign(
        accessTokenPayload(user.id, user.role, user.storeId),
        secret,
      )

      const refreshToken = crypto.randomUUID()
      await db.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
      })

      return { accessToken, refreshToken, user: toUserResponse(user) }
    },

    async refresh(data: { token: string }) {
      const stored = await db.refreshToken.findUnique({ where: { token: data.token } })
      if (!stored || stored.expiresAt < new Date()) {
        throw new HTTPException(401, { message: 'Invalid or expired refresh token' })
      }

      const user = await db.user.findUnique({ where: { id: stored.userId } })
      if (!user) throw new HTTPException(401, { message: 'Invalid credentials' })

      await db.refreshToken.delete({ where: { id: stored.id } })

      const accessToken = await sign(
        accessTokenPayload(user.id, user.role, user.storeId),
        secret,
      )

      const refreshToken = crypto.randomUUID()
      await db.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
      })

      return { accessToken, refreshToken }
    },

    async logout(userId: number) {
      await db.refreshToken.deleteMany({ where: { userId } })
    },

    async switchStore(userId: number, storeId: number) {
      const store = await db.store.findUnique({ where: { id: storeId } })
      if (!store) throw new HTTPException(404, { message: 'Store not found' })
      if (!store.active) throw new HTTPException(422, { message: 'Store is inactive' })

      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user) throw new HTTPException(404, { message: 'User not found' })

      const accessToken = await sign(
        accessTokenPayload(user.id, user.role, storeId),
        secret,
      )

      return { accessToken }
    },
  }
}
