import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number using South Asian (lakh/crore) grouping.
 * 20000 → "20,000"   100000 → "1,00,000"   10000000 → "1,00,00,000"
 */
export const fmtAmount = (
  value: number | string | undefined | null,
  opts?: { min?: number; max?: number },
): string => {
  const n = Number(value ?? 0) || 0
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: opts?.min ?? 0,
    maximumFractionDigits: opts?.max ?? 2,
  })
}
