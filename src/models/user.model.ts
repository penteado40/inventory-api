export type UserRow = {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'operator' | 'viewer'
  storeId: number | null
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserResponse = Omit<UserRow, 'password'>

export function toUserResponse(row: UserRow): UserResponse {
  const { password: _password, ...rest } = row
  return {
    ...rest,
    createdAt: new Date(row.createdAt.toISOString()),
    updatedAt: new Date(row.updatedAt.toISOString()),
  }
}
