import { z } from 'zod'
import { Behavior } from '../enums'

const CREATE = z.object({
  name: z.string().min(1),
  behavior: z.nativeEnum(Behavior),
})

const UPDATE = z.object({
  name: z.string().min(1).optional(),
})

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  behavior: z.nativeEnum(Behavior).optional(),
  q: z.string().optional(),
})

export const MovementTypeRequestSchema = { CREATE, UPDATE, GET, DELETE: GET, SEARCH }
