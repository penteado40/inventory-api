import { z } from 'zod'
import { Behavior } from '../enums'
export { Behavior }

const dateString = z.string().datetime()

export type MovementTypeRow = {
  id: number
  name: string
  behavior: Behavior
  storeId: number
  createdAt: Date
  updatedAt: Date
}

export const MovementTypeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  behavior: z.enum(['entrada', 'saida', 'encomenda']),
  storeId: z.number(),
  createdAt: dateString,
  updatedAt: dateString,
})

export type MovementTypeResponse = z.infer<typeof MovementTypeResponseSchema>

export function toMovementTypeResponse(row: MovementTypeRow): MovementTypeResponse {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
