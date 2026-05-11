import { z } from 'zod'

const CREATE = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'operator', 'viewer']),
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
  role: z.enum(['admin', 'operator', 'viewer']),
})

const CHANGE_STORE = z.object({
  storeId: z.number().int().positive().nullable(),
})

const GET = z.object({ id: z.coerce.number().int().positive() })

const SEARCH = z.object({
  q: z.string().optional(),
  role: z.enum(['admin', 'operator', 'viewer']).optional(),
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
