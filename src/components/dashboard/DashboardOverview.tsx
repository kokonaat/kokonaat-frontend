import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts"
import { format, parseISO } from "date-fns"
import { useShopStore } from "@/stores/shopStore"
import { useDashboardData } from "@/hooks/useDashboard"
import { NoDataFound } from "../NoDataFound"

const DashboardOverview = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  // default: last 12 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - 11)

  const formattedStartDate = format(startDate, "yyyy-MM-dd")
  const formattedEndDate = format(endDate, "yyyy-MM-dd")

  const { data } = useDashboardData({
    shopId: shopId || "",
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  })

  const chartData =
    data?.last12MonthsRevenue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((item: any) => {
        const monthName = format(parseISO(item.month + "-01"), "MMM")
        return {
          name: monthName,
          total: item.revenue || 0,
        }
      })
      .reverse() || []

  const hasData = chartData.some((item: { total: number }) => item.total > 0)

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Sale's Graph Data"
          details="Create a transaction to view your sales graph."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-auto">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `৳${value}`}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DashboardOverview