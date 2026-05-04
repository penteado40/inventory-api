import { z } from 'zod'

const CREATE = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
})

const UPDATE = CREATE.partial()

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  q: z.string().optional(),
  active: z.coerce.boolean().optional(),
})

export const StoreRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
