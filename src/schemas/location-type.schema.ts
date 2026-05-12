import { z } from 'zod'

const CREATE = z.object({ name: z.string().min(1) })
const UPDATE = CREATE.partial()
const GET = z.object({ id: z.coerce.number().int().positive() })
const SEARCH = z.object({ q: z.string().optional() })

export const LocationTypeRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
