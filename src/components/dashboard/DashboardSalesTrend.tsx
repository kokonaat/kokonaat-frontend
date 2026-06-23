import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'
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
  getChartTickInterval,
} from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface DashboardSalesTrendProps {
  data?: DashboardData
  isLoading?: boolean
}

const DashboardSalesTrend = ({ data, isLoading }: DashboardSalesTrendProps) => {
  const { t } = useTranslation('dashboard')

  const chartConfig = useMemo(
    () =>
      ({
        total: {
          label: t('charts.salesTrend.label'),
          theme: {
            light: 'hsl(221, 83%, 53%)',
            dark: 'hsl(221, 83%, 60%)',
          },
        },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData =
    data?.salesTrend?.map((item) => ({
      name: format(parseISO(item.date), 'MMM d'),
      total: item.total || 0,
    })) || []

  const hasData = chartData.some((item) => item.total > 0)
  const tickInterval = getChartTickInterval(chartData.length)
  const denseLabels = chartData.length > 10

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
          message={t('charts.salesTrend.emptyMessage')}
          details={t('charts.salesTrend.emptyDetails')}
        />
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={dashboardChartClassName}>
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 8,
          left: 0,
          bottom: denseLabels ? 20 : 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          interval={tickInterval}
          angle={denseLabels ? -35 : 0}
          textAnchor={denseLabels ? 'end' : 'middle'}
          height={denseLabels ? 50 : 30}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : String(v)
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export default DashboardSalesTrend
