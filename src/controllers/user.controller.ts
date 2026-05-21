import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import type { AppEnv } from '../types/hono-env'
import { UserRequestSchema } from '../schemas/user.schema'
import { createUserService } from '../services/user.service'
import { requireRole } from '../middlewares/role.middleware'
import { errorResponses, idPathParam, queryParam } from '../docs/openapi'
import { getServiceDeps } from '../lib/service-deps'
import { mapResponses } from '../lib/openapi'
import { UserListResponseSchema, UserSingleResponseSchema } from '../docs/response-schemas'

export const userController = new Hono<AppEnv>()

userController.get(
  '/users',
  describeRoute({
    summary: 'Listar usuários',
    description: 'Retorna todos os usuários. Filtrável por nome, email e role.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [
      queryParam('q', { type: 'string' }, 'Filtrar por nome ou email'),
      queryParam('role', { type: 'string', enum: ['admin', 'operator', 'viewer'] }, 'Filtrar por role'),
    ],
    responses: {
      ...mapResponses({ schema: UserListResponseSchema, successMessage: 'Usuários listados com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('query', UserRequestSchema.SEARCH),
  requireRole('admin'),
  async (c) => {
    const search = c.req.valid('query')
    const service = createUserService(getServiceDeps(c))
    const data = await service.list(search)
    return c.json({ data })
  },
)

userController.post(
  '/users',
  describeRoute({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário. O email deve ser único. Password é armazenado como hash.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Usuário criado com sucesso', status: 201 }),
      ...errorResponses,
    },
  }),
  validator('json', UserRequestSchema.CREATE),
  requireRole('admin'),
  async (c) => {
    const body = c.req.valid('json')
    const service = createUserService(getServiceDeps(c))
    const data = await service.create(body)
    return c.json({ data }, 201)
  },
)

userController.get(
  '/users/:id',
  describeRoute({
    summary: 'Buscar usuário por id',
    description: 'Retorna os dados de um usuário específico.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Usuário encontrado' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.GET),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createUserService(getServiceDeps(c))
    const data = await service.getById(id)
    return c.json({ data })
  },
)

userController.put(
  '/users/:id',
  describeRoute({
    summary: 'Atualizar usuário',
    description: 'Atualiza nome e telefone do usuário.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Usuário atualizado com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.GET),
  validator('json', UserRequestSchema.UPDATE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const service = createUserService(getServiceDeps(c))
    const data = await service.update(id, body)
    return c.json({ data })
  },
)

userController.put(
  '/users/:id/password',
  describeRoute({
    summary: 'Resetar senha do usuário',
    description: 'Define uma nova senha para o usuário.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Senha alterada com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.GET),
  validator('json', UserRequestSchema.RESET_PASSWORD),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const { password } = c.req.valid('json')
    const service = createUserService(getServiceDeps(c))
    const data = await service.resetPassword(id, password)
    return c.json({ data })
  },
)

userController.put(
  '/users/:id/role',
  describeRoute({
    summary: 'Alterar role do usuário',
    description: 'Altera a role do usuário. Exclusivo para admin.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Role alterada com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.GET),
  validator('json', UserRequestSchema.CHANGE_ROLE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const { role } = c.req.valid('json')
    const service = createUserService(getServiceDeps(c))
    const data = await service.changeRole(id, role)
    return c.json({ data })
  },
)

userController.put(
  '/users/:id/store',
  describeRoute({
    summary: 'Alterar store do usuário',
    description: 'Vincula o usuário a uma store. Enviar `storeId: null` para remover o vínculo.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Store alterada com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.GET),
  validator('json', UserRequestSchema.CHANGE_STORE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const { storeId } = c.req.valid('json')
    const service = createUserService(getServiceDeps(c))
    const data = await service.changeStore(id, storeId)
    return c.json({ data })
  },
)

userController.delete(
  '/users/:id',
  describeRoute({
    summary: 'Remover usuário',
    description: 'Remove permanentemente um usuário.',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    parameters: [idPathParam],
    responses: {
      ...mapResponses({ schema: UserSingleResponseSchema, successMessage: 'Usuário removido com sucesso' }),
      ...errorResponses,
    },
  }),
  validator('param', UserRequestSchema.DELETE),
  requireRole('admin'),
  async (c) => {
    const { id } = c.req.valid('param')
    const service = createUserService(getServiceDeps(c))
    const data = await service.remove(id)
    return c.json({ data })
  },
)
