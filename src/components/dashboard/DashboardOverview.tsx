import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from "recharts"
import { format, parseISO } from "date-fns"
// import { TrendingUp } from "lucide-react"
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
    last12MonthsRevenue?: Array<{
      month: string
      revenue: number
    }>
  }
  isLoading?: boolean
}

// chart configuration for ChartContainer
const chartConfig = {
  total: {
    label: "Revenue",
    // using the primary color from your theme
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const DashboardOverview = ({ data, isLoading }: DashboardOverviewProps) => {

  const chartData =
    data?.last12MonthsRevenue
      ?.map((item) => {
        // format the month from "YYYY-MM" to "MMM" (e.g., "Jan")
        const monthName = format(parseISO(item.month + "-01"), "MMM")
        return {
          name: monthName,
          total: item.revenue || 0,
        }
      })
      .reverse() || []

  const hasData = chartData.some((item) => item.total > 0)

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-[350px]">
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

    <ChartContainer config={chartConfig} className="min-h-[340px] w-full">
      <RechartsBarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        // The stroke and fontSize are now often handled by CSS vars via shadcn's component
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`} // Keep your custom formatter
        />

        <ChartTooltip cursor={false} content={<ChartTooltipContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value
            return `৳${numericValue.toFixed(0)}`
          }}
        />} />
        <Bar
          dataKey="total"
          // using the color from chartConfig
          fill="var(--color-total)"
          radius={[4, 4, 0, 0]}
          // Using utility class for the primary color
          className="fill-primary"
        />
      </RechartsBarChart>
    </ChartContainer>
  )
}

export default DashboardOverview