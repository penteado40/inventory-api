// Domain owns Behavior — Prisma uses identical string values, no migration needed
export const Behavior = { entrada: 'entrada', saida: 'saida', encomenda: 'encomenda' } as const
export type Behavior = (typeof Behavior)[keyof typeof Behavior]
