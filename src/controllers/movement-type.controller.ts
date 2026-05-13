import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { MovementTypeRequestSchema } from '../schemas/movement-type.schema'
import { createMovementTypeService } from '../services/movement-type.service'
import { requireRole } from '../middlewares/role.middleware'
import { storeIdHeader, errorResponses, idPathParam, queryParam } from '../docs/openapi'
import { mapResponses } from '../lib/openapi'
import {
  MovementTypeListResponseSchema,
  MovementTypeSingleResponseSchema,
} from '../docs/response-schemas'

export const movementTypeController = new Hono<AppEnv>()

movementTypeController.get(
  '/movement-types',
  describeRoute({
    summary: 'Listar tipos de movimentação',
    description: 'Retorna todos os tipos de movimentação da loja.',
    tags: ['MovementTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [
      storeIdHeader,
      queryParam('behavior', { type: 'string', enum: ['entrada', 'saida', 'encomenda'] }, 'Filtrar por behavior'),
      queryParam('q', { type: 'string' }, 'Filtrar por nome'),
    ],
    responses: {
      ...mapResponses({
        schema: MovementTypeListResponseSchema,
        successMessage: 'Tipos de movimentação listados com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('query', MovementTypeRequestSchema.SEARCH),
  requireRole('admin', 'operator', 'viewer'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createMovementTypeService(c)
    const data = await service.list(search)
    return c.json({ data })
  },
)

movementTypeController.post(
  '/movement-types',
  describeRoute({
    summary: 'Criar tipo de movimentação',
    description: 'Cria um novo tipo de movimentação para a loja.',
    tags: ['MovementTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader],
    responses: {
      ...mapResponses({
        schema: MovementTypeSingleResponseSchema,
        successMessage: 'Tipo de movimentação criado com sucesso',
        status: 201,
      }),
      ...errorResponses,
    },
  }),
  validator('json', MovementTypeRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createMovementTypeService(c)
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

movementTypeController.put(
  '/movement-types/:id',
  describeRoute({
    summary: 'Atualizar tipo de movimentação',
    description: 'Atualiza o nome do tipo de movimentação. behavior nunca pode ser alterado.',
    tags: ['MovementTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: MovementTypeSingleResponseSchema,
        successMessage: 'Tipo de movimentação atualizado com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', MovementTypeRequestSchema.GET),
  validator('json', MovementTypeRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createMovementTypeService(c)
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

movementTypeController.delete(
  '/movement-types/:id',
  describeRoute({
    summary: 'Remover tipo de movimentação',
    description: 'Remove um tipo de movimentação. Falha se houver movimentações vinculadas.',
    tags: ['MovementTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: MovementTypeSingleResponseSchema,
        successMessage: 'Tipo de movimentação removido com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', MovementTypeRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createMovementTypeService(c)
    const data = await service.remove(id)
    return c.json({ data })
  },
)
