import { z } from 'zod'

const dateString = z.string().datetime()

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

export const StoreResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  active: z.boolean(),
  requireProductCode: z.boolean(),
  createdAt: dateString,
  updatedAt: dateString,
})

function dataOf<T extends z.ZodType>(schema: T) {
  return z.object({ data: schema })
}

// Auth
export const LoginResponseSchema = dataOf(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserResponseSchema,
  }),
)
export const RefreshResponseSchema = dataOf(
  z.object({ accessToken: z.string(), refreshToken: z.string() }),
)
export const LogoutResponseSchema = dataOf(z.null())
export const SwitchStoreResponseSchema = dataOf(z.object({ accessToken: z.string() }))

// User
export const UserListResponseSchema = dataOf(z.array(UserResponseSchema))
export const UserSingleResponseSchema = dataOf(UserResponseSchema)

// Store
export const StoreListResponseSchema = dataOf(z.array(StoreResponseSchema))
export const StoreSingleResponseSchema = dataOf(StoreResponseSchema)

// LocationType
export const LocationTypeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  storeId: z.number(),
  createdAt: dateString,
  updatedAt: dateString,
})
export const LocationTypeListResponseSchema = dataOf(z.array(LocationTypeResponseSchema))
export const LocationTypeSingleResponseSchema = dataOf(LocationTypeResponseSchema)

// Location
export const LocationResponseSchema = z.object({
  id: z.number(),
  number: z.number(),
  locationTypeId: z.number(),
  storeId: z.number(),
  parentId: z.number().nullable(),
  displayName: z.string(),
  createdAt: dateString,
  updatedAt: dateString,
})
export const LocationWithChildrenResponseSchema = LocationResponseSchema.extend({
  children: z.array(LocationResponseSchema),
})
export const LocationListResponseSchema = dataOf(z.array(LocationWithChildrenResponseSchema))
export const LocationSingleResponseSchema = dataOf(LocationWithChildrenResponseSchema)
