export function storeScope(storeId: number | null): { storeId?: number } {
  if (storeId !== null) return { storeId }
  return {}
}
