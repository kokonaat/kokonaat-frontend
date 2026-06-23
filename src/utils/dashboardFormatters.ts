import type { TFunction } from 'i18next'

/** Shared chart sizing — overrides ChartContainer's default aspect-video in narrow grids */
export const dashboardChartClassName =
  'aspect-auto h-[260px] w-full min-w-0 max-w-full'

export const LOW_STOCK_THRESHOLD = 10

export const formatCurrency = (value: number | undefined | null): string => {
  const n = Number(value ?? 0)
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export const formatPercentChange = (value: number | undefined | null): string => {
  const n = Number(value ?? 0)
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

export const formatExpenseType = (
  type: string,
  t: TFunction<'enums', undefined>,
): string => t(`expenseType.${type}`)

/** Reduce x-axis label density for longer date ranges */
export const getChartTickInterval = (dataLength: number): number | 'preserveStartEnd' => {
  if (dataLength <= 7) return 0
  if (dataLength <= 14) return 1
  return Math.max(1, Math.floor(dataLength / 6))
}
