import type { Context } from 'hono'
import type { AppEnv, ServiceDeps } from '../types/hono-env'

export function getServiceDeps(c: Context<AppEnv>): ServiceDeps {
  return { db: c.get('db'), storeId: c.get('storeId') ?? null }
}
