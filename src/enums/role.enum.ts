// Domain owns Role — Prisma uses identical string values, no migration needed
export const Role = { admin: 'admin', operator: 'operator', viewer: 'viewer' } as const
export type Role = (typeof Role)[keyof typeof Role]
