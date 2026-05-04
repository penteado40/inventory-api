import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { zValidator as validator } from '@hono/zod-validator'
import type { AppEnv } from '../types/hono-env'
import { AuthRequestSchema } from '../schemas/auth.schema'
import { createAuthService } from '../services/auth.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  resolver,
  errorResponses,
  publicErrorResponses,
} from '../docs/openapi'
import {
  LoginResponseSchema,
  RefreshResponseSchema,
  LogoutResponseSchema,
  SwitchStoreResponseSchema,
} from '../docs/response-schemas'

export const authController = new Hono<AppEnv>()

authController.post(
  '/auth/login',
  describeRoute({
    summary: 'Login',
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: resolver(AuthRequestSchema.LOGIN) },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(LoginResponseSchema) } },
      },
      ...publicErrorResponses,
    },
  }),
  validator('json', AuthRequestSchema.LOGIN),
  async (c) => {
    const body = c.req.valid('json')
    const service = createAuthService(c)
    const data = await service.login(body)
    return c.json({ data })
  },
)

authController.post(
  '/auth/refresh',
  describeRoute({
    summary: 'Renovar access token',
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: resolver(AuthRequestSchema.REFRESH) },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(RefreshResponseSchema) } },
      },
      ...publicErrorResponses,
    },
  }),
  validator('json', AuthRequestSchema.REFRESH),
  async (c) => {
    const body = c.req.valid('json')
    const service = createAuthService(c)
    const data = await service.refresh(body)
    return c.json({ data })
  },
)

authController.post(
  '/auth/logout',
  describeRoute({
    summary: 'Logout',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(LogoutResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  authMiddleware,
  async (c) => {
    const { sub } = c.get('jwtPayload')
    const service = createAuthService(c)
    await service.logout(sub)
    return c.json({ data: null })
  },
)

authController.post(
  '/auth/switch-store',
  describeRoute({
    summary: 'Trocar contexto de loja (admin)',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: resolver(AuthRequestSchema.SWITCH_STORE) },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(SwitchStoreResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  authMiddleware,
  validator('json', AuthRequestSchema.SWITCH_STORE),
  requireRole('admin'),
  async (c) => {
    const { storeId } = c.req.valid('json')
    const { sub } = c.get('jwtPayload')
    const service = createAuthService(c)
    const data = await service.switchStore(sub, storeId)
    return c.json({ data })
  },
)
