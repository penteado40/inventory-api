import { resolver } from 'hono-openapi'
import type { ZodType } from 'zod'

type MapResponsesOptions = {
  schema: ZodType
  successMessage: string
  status?: number
}

export function mapResponses({ schema, successMessage, status = 200 }: MapResponsesOptions) {
  return {
    [status]: {
      description: successMessage,
      content: {
        'application/json': {
          schema: resolver(schema),
        },
      },
    },
    400: { description: 'Bad Request — validation failed' },
    404: { description: 'Not Found' },
    500: { description: 'Internal Server Error' },
  }
}
