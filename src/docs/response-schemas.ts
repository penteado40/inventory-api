import { z } from 'zod'
import { UserResponseSchema } from '../models/user.model'
import { StoreResponseSchema } from '../models/store.model'
import { LocationTypeResponseSchema } from '../models/location-type.model'
import { LocationResponseSchema, LocationWithChildrenResponseSchema } from '../models/location.model'
import { MovementTypeResponseSchema } from '../models/movement-type.model'

export {
  UserResponseSchema,
  StoreResponseSchema,
  LocationTypeResponseSchema,
  LocationResponseSchema,
  LocationWithChildrenResponseSchema,
  MovementTypeResponseSchema,
}

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
export const LocationTypeListResponseSchema = dataOf(z.array(LocationTypeResponseSchema))
export const LocationTypeSingleResponseSchema = dataOf(LocationTypeResponseSchema)

// Location
export const LocationListResponseSchema = dataOf(z.array(LocationWithChildrenResponseSchema))
export const LocationSingleResponseSchema = dataOf(LocationWithChildrenResponseSchema)

// MovementType
export const MovementTypeListResponseSchema = dataOf(z.array(MovementTypeResponseSchema))
export const MovementTypeSingleResponseSchema = dataOf(MovementTypeResponseSchema)
