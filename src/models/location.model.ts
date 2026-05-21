import { z } from 'zod'
import type { LocationTypeRow } from './location-type.model'

const dateString = z.string().datetime()

export type LocationRow = {
  id: number
  number: number
  locationTypeId: number
  storeId: number
  parentId: number | null
  createdAt: Date
  updatedAt: Date
  locationType: LocationTypeRow
}

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

export type LocationResponse = z.infer<typeof LocationResponseSchema>
export type LocationWithChildrenResponse = z.infer<typeof LocationWithChildrenResponseSchema>

export function toLocationResponse(row: LocationRow): LocationResponse {
  return {
    id: row.id,
    number: row.number,
    locationTypeId: row.locationTypeId,
    storeId: row.storeId,
    parentId: row.parentId,
    displayName: `${row.locationType.name} ${row.number}`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toLocationWithChildrenResponse(
  row: LocationRow & { children: LocationRow[] },
): LocationWithChildrenResponse {
  return {
    ...toLocationResponse(row),
    children: row.children.map(toLocationResponse),
  }
}
