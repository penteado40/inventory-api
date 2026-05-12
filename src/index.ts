import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from './types/hono-env'
import { prisma } from './lib/prisma'
import { startDocs } from './lib/docs'
import { authController, storeController, userController, locationTypeController, locationController } from './routes/index'
import { authMiddleware } from './middlewares/auth.middleware'
import { storeContextMiddleware } from './middlewares/store-context.middleware'

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

startDocs(app)

// Public routes — before auth middleware
app.route('/', authController)

// Protected routes — after auth + store-context middleware
app.use('*', authMiddleware)
app.use('*', storeContextMiddleware)
app.route('/', storeController)
app.route('/', userController)
app.route('/', locationTypeController)
app.route('/', locationController)

export default {
  port: 3000,
  fetch: app.fetch,
}
