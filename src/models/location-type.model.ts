import { z } from 'zod'

const dateString = z.string().datetime()

export type LocationTypeRow = {
  id: number
  name: string
  storeId: number
  createdAt: Date
  updatedAt: Date
}

export const LocationTypeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  storeId: z.number(),
  createdAt: dateString,
  updatedAt: dateString,
})

export type LocationTypeResponse = z.infer<typeof LocationTypeResponseSchema>

export function toLocationTypeResponse(row: LocationTypeRow): LocationTypeResponse {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
