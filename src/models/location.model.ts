import type { LocationTypeRow } from './location-type.model'

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

export type LocationResponse = Omit<LocationRow, 'locationType'> & {
  displayName: string
}

export type LocationWithChildrenResponse = LocationResponse & {
  children: LocationResponse[]
}

export function toLocationResponse(row: LocationRow): LocationResponse {
  return {
    id: row.id,
    number: row.number,
    locationTypeId: row.locationTypeId,
    storeId: row.storeId,
    parentId: row.parentId,
    displayName: `${row.locationType.name} ${row.number}`,
    createdAt: new Date(row.createdAt.toISOString()),
    updatedAt: new Date(row.updatedAt.toISOString()),
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
