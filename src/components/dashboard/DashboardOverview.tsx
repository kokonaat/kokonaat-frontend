import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from 'recharts'
import { useShopStore } from '@/stores/shopStore'
import { format } from 'date-fns'
import { useDashboardData } from '@/hooks/useDashboard'

const DashboardOverview = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  // default to last 12 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - 11)

  const formattedStartDate = format(startDate, 'yyyy-MM-dd')
  const formattedEndDate = format(endDate, 'yyyy-MM-dd')

  const { data } = useDashboardData({
    shopId: shopId || '',
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  })

  // map api data to chart format
  const chartData =
    data?.last12MonthsRevenue?.map((item: any) => ({
      name: item.month,
      total: item.totalAmount || 0,
    })) || []

  // if no data, show empty months
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  const finalData =
    chartData.length === 0
      ? months.map((m) => ({ name: m, total: 0 }))
      : chartData

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={finalData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default DashboardOverview