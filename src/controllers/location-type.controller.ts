import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { LocationTypeRequestSchema } from '../schemas/location-type.schema'
import { createLocationTypeService } from '../services/location-type.service'
import { requireRole } from '../middlewares/role.middleware'
import { storeIdHeader, errorResponses, idPathParam, queryParam } from '../docs/openapi'
import { mapResponses } from '../lib/openapi'
import {
  LocationTypeListResponseSchema,
  LocationTypeSingleResponseSchema,
} from '../docs/response-schemas'

export const locationTypeController = new Hono<AppEnv>()

locationTypeController.get(
  '/location-types',
  describeRoute({
    summary: 'Listar tipos de localização',
    description: 'Retorna todos os tipos de localização da loja.',
    tags: ['LocationTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, queryParam('q', { type: 'string' }, 'Filtrar por nome')],
    responses: {
      ...mapResponses({
        schema: LocationTypeListResponseSchema,
        successMessage: 'Tipos de localização listados com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('query', LocationTypeRequestSchema.SEARCH),
  requireRole('admin', 'operator', 'viewer'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createLocationTypeService(c)
    const data = await service.list(search)
    return c.json({ data })
  },
)

locationTypeController.post(
  '/location-types',
  describeRoute({
    summary: 'Criar tipo de localização',
    description: 'Cria um novo tipo de localização para a loja.',
    tags: ['LocationTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader],
    responses: {
      ...mapResponses({
        schema: LocationTypeSingleResponseSchema,
        successMessage: 'Tipo de localização criado com sucesso',
        status: 201,
      }),
      ...errorResponses,
    },
  }),
  validator('json', LocationTypeRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createLocationTypeService(c)
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

locationTypeController.put(
  '/location-types/:id',
  describeRoute({
    summary: 'Atualizar tipo de localização',
    description: 'Atualiza o nome de um tipo de localização.',
    tags: ['LocationTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: LocationTypeSingleResponseSchema,
        successMessage: 'Tipo de localização atualizado com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', LocationTypeRequestSchema.GET),
  validator('json', LocationTypeRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createLocationTypeService(c)
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

locationTypeController.delete(
  '/location-types/:id',
  describeRoute({
    summary: 'Remover tipo de localização',
    description: 'Remove um tipo de localização. Falha se houver localizações vinculadas.',
    tags: ['LocationTypes'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: LocationTypeSingleResponseSchema,
        successMessage: 'Tipo de localização removido com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', LocationTypeRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createLocationTypeService(c)
    const data = await service.remove(id)
    return c.json({ data })
  },
)
