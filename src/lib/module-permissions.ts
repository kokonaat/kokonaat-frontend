export const ASSIGNABLE_MODULE_KEYS = [
  'inventory',
  'transactions',
  'customers',
  'vendors',
  'expenses',
  'reports',
] as const

export type ModuleKey = (typeof ASSIGNABLE_MODULE_KEYS)[number]

export const MODULE_NAV_ROUTES: Record<ModuleKey, string[]> = {
  inventory: ['/inventory', '/uom'],
  transactions: ['/transactions'],
  customers: ['/customers'],
  vendors: ['/vendors'],
  expenses: ['/expense'],
  reports: ['/reports', '/'],
}

export const DEFAULT_MODULES_BY_ROLE: Record<string, ModuleKey[]> = {
  shop_manager: [...ASSIGNABLE_MODULE_KEYS],
  sales_man: ['transactions', 'customers', 'inventory', 'reports'],
}

export function buildEmployeeEmailPreview(username: string, shopSlug?: string | null) {
  const trimmed = username.trim().toLowerCase()
  if (!trimmed || !shopSlug) return ''
  return `${trimmed}@${shopSlug}.com`
}
