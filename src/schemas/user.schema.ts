import { z } from 'zod'
import { Role } from '../enums'

const CREATE = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  storeId: z.number().int().positive().optional(),
  phone: z.string().regex(/^\d*$/).optional(),
})

const UPDATE = z.object({
  name: z.string().optional(),
  phone: z.string().regex(/^\d*$/).optional(),
})

const RESET_PASSWORD = z.object({
  password: z.string().min(8),
})

const CHANGE_ROLE = z.object({
  role: z.nativeEnum(Role),
})

const CHANGE_STORE = z.object({
  storeId: z.number().int().positive().nullable(),
})

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  active: z.coerce.boolean().optional().default(true),
})

export const UserRequestSchema = {
  CREATE,
  UPDATE,
  GET,
  DELETE: GET,
  SEARCH,
  RESET_PASSWORD,
  CHANGE_ROLE,
  CHANGE_STORE,
}
