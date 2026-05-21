import { z } from 'zod'
import { Role } from '../enums'
export { Role }

const dateString = z.string().datetime()

export type UserRow = {
  id: number
  name: string
  email: string
  password: string
  role: Role
  storeId: number | null
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'operator', 'viewer']),
  storeId: z.number().nullable(),
  phone: z.string().nullable(),
  active: z.boolean(),
  createdAt: dateString,
  updatedAt: dateString,
})

export type UserResponse = z.infer<typeof UserResponseSchema>

export function toUserResponse(row: UserRow): UserResponse {
  const { password: _password, ...rest } = row
  return {
    ...rest,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
