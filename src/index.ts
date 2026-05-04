import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { openAPIRouteHandler } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import type { AppEnv } from './types/hono-env'
import { prisma } from './lib/prisma'
import { authController, storeController, userController } from './routes/index'
import { authMiddleware } from './middlewares/auth.middleware'
import { storeContextMiddleware } from './middlewares/store-context.middleware'
import { securityScheme } from './docs/openapi'

const app = new Hono<AppEnv>()

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.use('*', async (c, next) => {
  c.set('db', prisma)
  await next()
})

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Authorization', 'Content-Type', 'X-Store-Id'],
  }),
)

// Public routes — before auth middleware
app.route('/', authController)

app.get(
  '/api/docs/spec',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Inventory API',
        version: '0.0.1',
        description: 'Inventory management REST API',
      },
      components: {
        securitySchemes: securityScheme,
      },
    },
  }),
)

app.get(
  '/api/docs',
  Scalar({
    url: '/api/docs/spec',
    pageTitle: 'Inventory API — Docs',
  }),
)

// Protected routes — after auth + store-context middleware
app.use('*', authMiddleware)
app.use('*', storeContextMiddleware)
app.route('/', storeController)
app.route('/', userController)

export default {
  port: 3000,
  fetch: app.fetch,
}
