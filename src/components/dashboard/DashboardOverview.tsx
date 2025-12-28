import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts"
import { format, parseISO } from "date-fns"
import {
  Card,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { NoDataFound } from "../NoDataFound"

interface DashboardOverviewProps {
  data?: {
    last12MonthsInflowOutflow?: Array<{
      month: string
      totalInflow: number
      totalOutflow: number
    }>
  }
  isLoading?: boolean
}

// chart configuration for ChartContainer
const chartConfig = {
  inflow: {
    label: "In",
    theme: {
      light: "hsl(0, 0%, 20%)", // dark gray/black for light mode
      dark: "hsl(0, 0%, 70%)", // light gray for dark mode
    },
  },
  outflow: {
    label: "Out",
    theme: {
      light: "hsl(0, 0%, 50%)", // medium gray for light mode
      dark: "hsl(0, 0%, 50%)", // medium gray for dark mode
    },
  },
} satisfies ChartConfig

const DashboardOverview = ({ data, isLoading }: DashboardOverviewProps) => {

  const chartData =
    data?.last12MonthsInflowOutflow
      ?.map((item) => {
        // format the month from "YYYY-MM" to "MMM" (e.g., "Jan")
        const monthName = format(parseISO(item.month + "-01"), "MMM")
        return {
          name: monthName,
          inflow: item.totalInflow || 0,
          outflow: item.totalOutflow || 0,
        }
      }) || []

  const hasData = chartData.some((item) => item.inflow > 0 || item.outflow > 0)

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-87.5">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Recent Transactions"
          details="Create a transaction to get started."
        />
      </div>
    )
  }

  // the highest revenue value for the CardFooter message
  // const totalRevenueSum = chartData.reduce((acc, item) => acc + item.total, 0)
  // const averageRevenue = totalRevenueSum / chartData.length

  // Example of a simplistic "trending up" calculation (e.g., last vs. second to last)
  // const isTrendingUp = chartData.length > 1 && chartData[chartData.length - 1].total > chartData[chartData.length - 2].total;


  return (

    <ChartContainer config={chartConfig} className="min-h-85 w-full">
      <RechartsBarChart 
        accessibilityLayer 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`}
        />
        <ChartTooltip 
          cursor={false} 
          content={<ChartTooltipContent
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => {
              const numericValue = typeof value === 'string' ? parseFloat(value) : value
              return `৳${numericValue.toFixed(0)}`
            }}
          />} 
        />
        <Legend />
        <Bar
          dataKey="inflow"
          fill="var(--color-inflow)"
          radius={[4, 4, 0, 0]}
          name="In"
        />
        <Bar
          dataKey="outflow"
          fill="var(--color-outflow)"
          radius={[4, 4, 0, 0]}
          name="Out"
        />
      </RechartsBarChart>
    </ChartContainer>
  )
}

export default DashboardOverview