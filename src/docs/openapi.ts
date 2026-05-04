export { resolver } from 'hono-openapi'

export const securityScheme = {
  bearerAuth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
}

export const storeIdHeader = {
  name: 'X-Store-Id',
  in: 'header',
  required: false,
  schema: { type: 'integer' },
  description: 'Admin only: filtra dados por loja específica. Omitir = visão global.',
}

export const idPathParam = {
  name: 'id',
  in: 'path' as const,
  required: true,
  schema: { type: 'integer' as const, minimum: 1 },
}

export function queryStringParam(name: string, description?: string) {
  return {
    name,
    in: 'query' as const,
    required: false,
    schema: { type: 'string' as const },
    ...(description ? { description } : {}),
  }
}

export function queryEnumParam(name: string, values: string[], description?: string) {
  return {
    name,
    in: 'query' as const,
    required: false,
    schema: { type: 'string' as const, enum: values },
    ...(description ? { description } : {}),
  }
}

export function queryBooleanParam(name: string, description?: string) {
  return {
    name,
    in: 'query' as const,
    required: false,
    schema: { type: 'boolean' as const },
    ...(description ? { description } : {}),
  }
}

export const errorResponses = {
  401: { description: 'Token ausente, inválido, expirado ou sem contexto de loja' },
  403: { description: 'Role sem permissão para esta operação' },
  404: { description: 'Recurso não encontrado' },
  422: { description: 'Loja inativa' },
}

export const publicErrorResponses = {
  400: { description: 'Payload inválido' },
  401: { description: 'Credenciais inválidas' },
}
