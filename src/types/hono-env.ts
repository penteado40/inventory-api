import type { PrismaClient } from '@prisma/client'
import { Role } from '../enums'

export type JwtPayload = {
  sub: number
  role: Role
  storeId: number | null
}

export type AppEnv = {
  Variables: {
    db: PrismaClient
    jwtPayload: JwtPayload
    storeId: number | null
  }
}

export type ServiceDeps = {
  db: PrismaClient
  storeId: number | null
}
