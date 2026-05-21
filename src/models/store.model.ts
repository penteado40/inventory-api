import { z } from 'zod'

const dateString = z.string().datetime()

export type StoreRow = {
  id: number
  name: string
  slug: string | null
  address: string | null
  phone: string | null
  active: boolean
  requireProductCode: boolean
  createdAt: Date
  updatedAt: Date
}

export const StoreResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  active: z.boolean(),
  requireProductCode: z.boolean(),
  createdAt: dateString,
  updatedAt: dateString,
})

export type StoreResponse = z.infer<typeof StoreResponseSchema>

export function toStoreResponse(row: StoreRow): StoreResponse {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
