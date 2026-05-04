import { z } from 'zod'

const CREATE = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'operator', 'viewer']),
  storeId: z.number().int().positive().optional(),
})

const UPDATE = CREATE.partial()

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  q: z.string().optional(),
  role: z.enum(['admin', 'operator', 'viewer']).optional(),
})

export const UserRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
