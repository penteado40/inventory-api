import { Scalar } from '@scalar/hono-api-reference'
import type { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'

export function startDocs(app: Hono<AppEnv>) {
  const isProduction = process.env.NODE_ENV === 'production'
  const serverUrl = isProduction
    ? process.env.API_URL ?? 'https://your-api.example.com'
    : `http://localhost:${process.env.PORT ?? 3000}`

  app.get(
    '/api/openapi',
    openAPIRouteHandler(app as unknown as Hono, {
      documentation: {
        openapi: '3.1.0',
        info: {
          title: 'Inventory API',
          version: '0.0.1',
          description: 'Inventory management REST API',
        },
        servers: [{ url: serverUrl, description: isProduction ? 'Production' : 'Local' }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    }),
  )

  app.get(
    '/api/docs',
    Scalar({
      theme: 'saturn',
      url: '/api/openapi',
      pageTitle: 'Inventory API — Docs',
    }),
  )
}
