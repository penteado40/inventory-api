import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { AuthRequestSchema } from '../schemas/auth.schema'
import { createAuthService } from '../services/auth.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { errorResponses, publicErrorResponses } from '../docs/openapi'
import { mapResponses } from '../lib/openapi'
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
    description: 'Autentica credenciais e retorna access token + refresh token.',
    tags: ['Auth'],
    responses: {
      ...mapResponses({ schema: LoginResponseSchema, successMessage: 'Login realizado com sucesso' }),
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
    description: 'Troca um refresh token válido por um novo par access + refresh token.',
    tags: ['Auth'],
    responses: {
      ...mapResponses({ schema: RefreshResponseSchema, successMessage: 'Tokens renovados com sucesso' }),
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
    description: 'Invalida os refresh tokens do usuário autenticado.',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      ...mapResponses({ schema: LogoutResponseSchema, successMessage: 'Logout realizado com sucesso' }),
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
    description: 'Gera um novo access token com storeId da loja selecionada. Exclusivo para admin.',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      ...mapResponses({ schema: SwitchStoreResponseSchema, successMessage: 'Contexto de loja alterado' }),
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
