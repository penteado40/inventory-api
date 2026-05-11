import * as z from 'zod'

const LOGIN = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const REFRESH = z.object({
  token: z.string().min(1),
})

const SWITCH_STORE = z.object({
  storeId: z.number().int().positive(),
})

export const AuthRequestSchema = { LOGIN, REFRESH, SWITCH_STORE }
