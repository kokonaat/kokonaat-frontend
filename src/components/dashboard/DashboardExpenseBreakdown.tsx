import { PieChart, Pie, Cell, Legend } from 'recharts'
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
  formatExpenseType,
} from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { useMemo } from 'react'

interface DashboardExpenseBreakdownProps {
  data?: DashboardData
  isLoading?: boolean
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(262, 83%, 58%)',
  'hsl(199, 89%, 48%)',
]

const DashboardExpenseBreakdown = ({
  data,
  isLoading,
}: DashboardExpenseBreakdownProps) => {
  const { t } = useTranslation('dashboard')
  const { t: tEnums } = useTranslation('enums')

  const chartConfig = useMemo(
    () =>
      ({
        value: { label: t('charts.expenseBreakdown.labelAmount') },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData =
    data?.expensesByType?.map((item) => ({
      name: formatExpenseType(item.type, tEnums),
      value: item.total,
    })) || []

  const hasData = chartData.some((item) => item.value > 0)

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
          message={t('charts.expenseBreakdown.emptyMessage')}
          details={t('charts.expenseBreakdown.emptyDetails')}
        />
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={dashboardChartClassName}>
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={70}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ChartContainer>
  )
}

export default DashboardExpenseBreakdown
