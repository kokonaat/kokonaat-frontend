import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
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
import { useMemo } from 'react'

interface DashboardOverviewProps {
  data?: DashboardData
  isLoading?: boolean
}

const DashboardOverview = ({ data, isLoading }: DashboardOverviewProps) => {
  const { t } = useTranslation('dashboard')

  const chartConfig = useMemo(
    () =>
      ({
        inflow: {
          label: t('charts.cashFlow.legendIn'),
          theme: {
            light: 'hsl(142, 76%, 36%)',
            dark: 'hsl(142, 70%, 45%)',
          },
        },
        outflow: {
          label: t('charts.cashFlow.legendOut'),
          theme: {
            light: 'hsl(0, 72%, 51%)',
            dark: 'hsl(0, 72%, 55%)',
          },
        },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData =
    data?.periodCashFlow?.map((item) => ({
      name: format(parseISO(item.date), 'MMM d'),
      inflow: item.totalInflow || 0,
      outflow: item.totalOutflow || 0,
    })) || []

  const hasData = chartData.some((item) => item.inflow > 0 || item.outflow > 0)
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
          message={t('charts.cashFlow.emptyMessage')}
          details={t('charts.cashFlow.emptyDetails')}
        />
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={dashboardChartClassName}>
      <RechartsBarChart
        accessibilityLayer
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
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="inflow"
          fill="var(--color-inflow)"
          radius={[4, 4, 0, 0]}
          name={t('charts.cashFlow.legendIn')}
        />
        <Bar
          dataKey="outflow"
          fill="var(--color-outflow)"
          radius={[4, 4, 0, 0]}
          name={t('charts.cashFlow.legendOut')}
        />
      </RechartsBarChart>
    </ChartContainer>
  )
}

export default DashboardOverview
