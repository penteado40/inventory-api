import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { LocationRequestSchema } from '../schemas/location.schema'
import { createLocationService } from '../services/location.service'
import { requireRole } from '../middlewares/role.middleware'
import { storeIdHeader, errorResponses, idPathParam, queryParam } from '../docs/openapi'
import { mapResponses } from '../lib/openapi'
import {
  LocationListResponseSchema,
  LocationSingleResponseSchema,
} from '../docs/response-schemas'

export const locationController = new Hono<AppEnv>()

locationController.get(
  '/locations',
  describeRoute({
    summary: 'Listar localizações',
    description: 'Retorna todas as localizações da loja. Inclui displayName calculado.',
    tags: ['Locations'],
    security: [{ bearerAuth: [] }],
    parameters: [
      storeIdHeader,
      queryParam('locationTypeId', { type: 'integer' }, 'Filtrar por tipo'),
      queryParam('parentId', { type: 'integer' }, 'Filtrar por localização pai'),
      queryParam('q', { type: 'string' }, 'Busca por displayName'),
    ],
    responses: {
      ...mapResponses({
        schema: LocationListResponseSchema,
        successMessage: 'Localizações listadas com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('query', LocationRequestSchema.SEARCH),
  requireRole('admin', 'operator', 'viewer'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createLocationService(c)
    const data = await service.list(search)
    return c.json({ data })
  },
)

locationController.post(
  '/locations',
  describeRoute({
    summary: 'Criar localização',
    description: 'Cria uma nova localização para a loja.',
    tags: ['Locations'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader],
    responses: {
      ...mapResponses({
        schema: LocationSingleResponseSchema,
        successMessage: 'Localização criada com sucesso',
        status: 201,
      }),
      ...errorResponses,
    },
  }),
  validator('json', LocationRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createLocationService(c)
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

locationController.get(
  '/locations/:id',
  describeRoute({
    summary: 'Buscar localização por id',
    description: 'Retorna uma localização com displayName e filhos diretos (um nível).',
    tags: ['Locations'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: LocationSingleResponseSchema,
        successMessage: 'Localização encontrada',
      }),
      ...errorResponses,
    },
  }),
  validator('param', LocationRequestSchema.GET),
  requireRole('admin', 'operator', 'viewer'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createLocationService(c)
    const data = await service.getById(id)
    return c.json({ data })
  },
)

locationController.put(
  '/locations/:id',
  describeRoute({
    summary: 'Atualizar localização',
    description: 'Atualiza campos da localização. Valida referência circular em parentId.',
    tags: ['Locations'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: LocationSingleResponseSchema,
        successMessage: 'Localização atualizada com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', LocationRequestSchema.GET),
  validator('json', LocationRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createLocationService(c)
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

locationController.delete(
  '/locations/:id',
  describeRoute({
    summary: 'Remover localização',
    description: 'Remove uma localização. Falha se tiver filhos ou produtos alocados.',
    tags: ['Locations'],
    security: [{ bearerAuth: [] }],
    parameters: [storeIdHeader, idPathParam],
    responses: {
      ...mapResponses({
        schema: LocationSingleResponseSchema,
        successMessage: 'Localização removida com sucesso',
      }),
      ...errorResponses,
    },
  }),
  validator('param', LocationRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createLocationService(c)
    const data = await service.remove(id)
    return c.json({ data })
  },
)
