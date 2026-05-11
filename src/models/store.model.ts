export type StoreRow = {
  id: number
  name: string
  slug: string | null
  address: string | null
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type StoreResponse = StoreRow

export function toStoreResponse(row: StoreRow): StoreResponse {
  return {
    ...row,
    createdAt: new Date(row.createdAt.toISOString()),
    updatedAt: new Date(row.updatedAt.toISOString()),
  }
}
