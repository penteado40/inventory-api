import { z } from 'zod'

const CREATE = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  requireProductCode: z.boolean().optional(),
})

const UPDATE = CREATE.partial()

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  q: z.string().optional(),
  active: z.coerce.boolean().optional().default(true),
})

export const StoreRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
