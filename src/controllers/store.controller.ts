import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { StoreRequestSchema } from '../schemas/store.schema'
import { createStoreService } from '../services/store.service'
import { requireRole } from '../middlewares/role.middleware'
import { errorResponses, idPathParam, queryParam } from '../docs/openapi'
import { getServiceDeps } from '../lib/service-deps'
import { mapResponses } from '../lib/openapi'
import { StoreListResponseSchema, StoreSingleResponseSchema } from '../docs/response-schemas'

export const storeController = new Hono<AppEnv>()

storeController.get(
  '/stores',
  describeRoute({
    summary: 'Listar lojas',
    description: 'Retorna todas as lojas. Filtrável por nome, slug e status.',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [
      queryParam('q', { type: 'string' }, 'Filtrar por nome ou slug'),
      queryParam('active', { type: 'boolean' }, 'Filtrar por status ativo/inativo'),
    ],
    responses: {
      ...mapResponses({ schema: StoreListResponseSchema, successMessage: 'Lojas listadas com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('query', StoreRequestSchema.SEARCH),
  requireRole('admin'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createStoreService(getServiceDeps(c))
    const data = await service.list(search)
    return c.json({ data })
  },
)

storeController.post(
  '/stores',
  describeRoute({
    summary: 'Criar loja',
    description: 'Cria uma nova loja. O slug deve ser único.',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    responses: {
      ...mapResponses({ schema: StoreSingleResponseSchema, successMessage: 'Loja criada com sucesso', status: 201 }),
      ...errorResponses,
    },
  }),
  validator('json', StoreRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createStoreService(getServiceDeps(c))
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

storeController.get(
  '/stores/:id',
  describeRoute({
    summary: 'Buscar loja por id',
    description: 'Retorna os dados de uma loja específica.',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: StoreSingleResponseSchema, successMessage: 'Loja encontrada' }),
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.GET),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createStoreService(getServiceDeps(c))
    const data = await service.getById(id)
    return c.json({ data })
  },
)

storeController.put(
  '/stores/:id',
  describeRoute({
    summary: 'Atualizar loja',
    description: 'Atualiza os dados de uma loja. O slug não pode ser alterado.',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: StoreSingleResponseSchema, successMessage: 'Loja atualizada com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.GET),
  validator('json', StoreRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createStoreService(getServiceDeps(c))
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

storeController.delete(
  '/stores/:id',
  describeRoute({
    summary: 'Desativar loja',
    description: 'Faz soft delete da loja (active = false). O registro não é removido do banco.',
    tags: ['Stores'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: StoreSingleResponseSchema, successMessage: 'Loja desativada com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', StoreRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createStoreService(getServiceDeps(c))
    const data = await service.remove(id)
    return c.json({ data })
  },
)
