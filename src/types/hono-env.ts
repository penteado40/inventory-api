import type { PrismaClient } from '@prisma/client'

export type JwtPayload = {
  sub: number
  role: 'admin' | 'operator' | 'viewer'
  storeId: number | null
}

export type AppEnv = {
  Variables: {
    db: PrismaClient
    jwtPayload: JwtPayload
    storeId: number | null
  }
}
