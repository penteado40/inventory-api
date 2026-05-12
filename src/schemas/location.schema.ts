import { z } from 'zod'

const CREATE = z.object({
  number: z.number().int().positive(),
  locationTypeId: z.number().int().positive(),
  parentId: z.number().int().positive().nullable().optional(),
})

const UPDATE = CREATE.partial()
const GET = z.object({ id: z.coerce.number().int().positive() })
const SEARCH = z.object({
  locationTypeId: z.coerce.number().int().positive().optional(),
  parentId: z.coerce.number().int().positive().optional(),
  q: z.string().optional(),
})

export const LocationRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
