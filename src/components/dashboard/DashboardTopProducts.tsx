import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { NoDataFound } from '../NoDataFound'
import type { DashboardData } from '@/interface/dashboardInterface'
import {
  dashboardChartClassName,
  formatCurrency,
} from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface DashboardTopProductsProps {
  data?: DashboardData
  isLoading?: boolean
}

const DashboardTopProducts = ({
  data,
  isLoading,
}: DashboardTopProductsProps) => {
  const { t } = useTranslation('dashboard')

  const chartConfig = useMemo(
    () =>
      ({
        revenue: {
          label: t('charts.topProducts.labelRevenue'),
          theme: {
            light: 'hsl(262, 83%, 58%)',
            dark: 'hsl(262, 83%, 65%)',
          },
        },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData =
    data?.topProducts?.map((item) => ({
      name: item.name.length > 12 ? `${item.name.slice(0, 12)}…` : item.name,
      fullName: item.name,
      revenue: item.revenue,
      unitsSold: item.unitsSold,
    })) || []

  const hasData = chartData.length > 0

  if (isLoading) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-muted-foreground">{t('charts.loadingChart')}</p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <NoDataFound
          message={t('charts.topProducts.emptyMessage')}
          details={t('charts.topProducts.emptyDetails')}
        />
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={dashboardChartClassName}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : String(v)
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          width={72}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const payload = item?.payload as {
                  unitsSold?: number
                  fullName?: string
                }
                return [
                  t('charts.topProducts.tooltipUnits', {
                    amount: formatCurrency(Number(value)),
                    units: payload?.unitsSold ?? 0,
                  }),
                  payload?.fullName ?? t('charts.topProducts.labelRevenue'),
                ]
              }}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}

export default DashboardTopProducts
