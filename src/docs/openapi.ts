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
  in: 'header' as const,
  required: false,
  schema: { type: 'integer' as const },
  description: 'Admin only: filtra dados por loja específica. Omitir = visão global.',
}

export const idPathParam = {
  name: 'id',
  in: 'path' as const,
  required: true,
  schema: { type: 'integer' as const, minimum: 1 },
}

export function queryParam(
  name: string,
  schema: { type: 'string' | 'number' | 'integer' | 'boolean'; enum?: string[] },
  description?: string,
) {
  return {
    name,
    in: 'query' as const,
    required: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: schema as any,
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
