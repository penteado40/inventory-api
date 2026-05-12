export type LocationTypeRow = {
  id: number
  name: string
  storeId: number
  createdAt: Date
  updatedAt: Date
}

export type LocationTypeResponse = LocationTypeRow

export function toLocationTypeResponse(row: LocationTypeRow): LocationTypeResponse {
  return {
    ...row,
    createdAt: new Date(row.createdAt.toISOString()),
    updatedAt: new Date(row.updatedAt.toISOString()),
  }
}
