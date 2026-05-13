import { Behavior } from '../enums'
export { Behavior }

export type MovementTypeRow = {
  id: number
  name: string
  behavior: Behavior
  storeId: number
  createdAt: Date
  updatedAt: Date
}

export type MovementTypeResponse = MovementTypeRow

export function toMovementTypeResponse(row: MovementTypeRow): MovementTypeResponse {
  return {
    ...row,
    createdAt: new Date(row.createdAt.toISOString()),
    updatedAt: new Date(row.updatedAt.toISOString()),
  }
}
