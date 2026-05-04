import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { zValidator as validator } from '@hono/zod-validator'
import type { AppEnv } from '../types/hono-env'
import { UserRequestSchema } from '../schemas/user.schema'
import { createUserService } from '../services/user.service'
import { requireRole } from '../middlewares/role.middleware'
import { errorResponses } from '../docs/openapi'

export const userController = new Hono<AppEnv>()

userController.get(
  '/users',
  describeRoute({
    summary: 'Listar usuários',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'OK' }, ...errorResponses },
  }),
  validator('query', UserRequestSchema.SEARCH),
  requireRole('admin'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createUserService(c)
    const data = await service.list(search)
    return c.json({ data })
  },
)

userController.post(
  '/users',
  describeRoute({
    summary: 'Criar usuário',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: { 201: { description: 'Created' }, ...errorResponses },
  }),
  validator('json', UserRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createUserService(c)
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

userController.get(
  '/users/:id',
  describeRoute({
    summary: 'Buscar usuário por id',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'OK' }, ...errorResponses },
  }),
  validator('param', UserRequestSchema.GET),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createUserService(c)
    const data = await service.getById(id)
    return c.json({ data })
  },
)

userController.put(
  '/users/:id',
  describeRoute({
    summary: 'Atualizar usuário',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'OK' }, ...errorResponses },
  }),
  validator('param', UserRequestSchema.GET),
  validator('json', UserRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createUserService(c)
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

userController.delete(
  '/users/:id',
  describeRoute({
    summary: 'Remover usuário',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'OK' }, ...errorResponses },
  }),
  validator('param', UserRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createUserService(c)
    const data = await service.remove(id)
    return c.json({ data })
  },
)
