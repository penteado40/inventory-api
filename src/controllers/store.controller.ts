import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { zValidator as validator } from '@hono/zod-validator'
import type { AppEnv } from '../types/hono-env'
import { StoreRequestSchema } from '../schemas/store.schema'
import { createStoreService } from '../services/store.service'
import { requireRole } from '../middlewares/role.middleware'
import {
  resolver,
  errorResponses,
  idPathParam,
  queryStringParam,
  queryBooleanParam,
} from '../docs/openapi'
import { StoreListResponseSchema, StoreSingleResponseSchema } from '../docs/response-schemas'

export const storeController = new Hono<AppEnv>()

storeController.get(
  '/stores',
  describeRoute({
    summary: 'Listar lojas',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [
      queryStringParam('q', 'Filtrar por nome ou slug'),
      queryBooleanParam('active', 'Filtrar por status ativo/inativo'),
    ],
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(StoreListResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  validator('query', StoreRequestSchema.SEARCH),
  requireRole('admin'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createStoreService(c)
    const data = await service.list(search)
    return c.json({ data })
  },
)

storeController.post(
  '/stores',
  describeRoute({
    summary: 'Criar loja',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: resolver(StoreRequestSchema.CREATE) },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: { 'application/json': { schema: resolver(StoreSingleResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  validator('json', StoreRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createStoreService(c)
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

storeController.get(
  '/stores/:id',
  describeRoute({
    summary: 'Buscar loja por id',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(StoreSingleResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.GET),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createStoreService(c)
    const data = await service.getById(id)
    return c.json({ data })
  },
)

storeController.put(
  '/stores/:id',
  describeRoute({
    summary: 'Atualizar loja',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: resolver(StoreRequestSchema.UPDATE) },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(StoreSingleResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.GET),
  validator('json', StoreRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createStoreService(c)
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

storeController.delete(
  '/stores/:id',
  describeRoute({
    summary: 'Desativar loja',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      200: {
        description: 'OK',
        content: { 'application/json': { schema: resolver(StoreSingleResponseSchema) } },
      },
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createStoreService(c)
    const data = await service.remove(id)
    return c.json({ data })
  },
)
