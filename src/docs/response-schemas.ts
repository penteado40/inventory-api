import { z } from 'zod'

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'operator', 'viewer']),
  storeId: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const StoreResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export function dataOf<T extends z.ZodType>(schema: T) {
  return z.object({ data: schema })
}

// Auth responses
export const LoginResponseSchema = dataOf(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserResponseSchema,
  }),
)

export const RefreshResponseSchema = dataOf(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
)

export const LogoutResponseSchema = dataOf(z.null())

export const SwitchStoreResponseSchema = dataOf(z.object({ accessToken: z.string() }))

// User responses
export const UserListResponseSchema = dataOf(z.array(UserResponseSchema))
export const UserSingleResponseSchema = dataOf(UserResponseSchema)

// Store responses
export const StoreListResponseSchema = dataOf(z.array(StoreResponseSchema))
export const StoreSingleResponseSchema = dataOf(StoreResponseSchema)
