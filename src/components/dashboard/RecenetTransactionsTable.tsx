import { NoDataFound } from '../NoDataFound'
import type { DashboardData } from '@/interface/dashboardInterface'
import { formatCurrency } from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface RecentTransactionsTableProps {
  data: DashboardData | undefined
}

const RecentTransactionsTable = ({ data }: RecentTransactionsTableProps) => {
  const { t } = useTranslation('dashboard')
  const { t: tEnums } = useTranslation('enums')
  const transactions = data?.recentTransactions || []
  const lastFiveTransactions = transactions.slice(0, 5)

  if (lastFiveTransactions.length === 0) {
    return (
      <NoDataFound
        message={t('recentTransactions.emptyMessage')}
        details={t('recentTransactions.emptyDetails')}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_120px_120px] gap-4 text-sm font-semibold text-muted-foreground">
        <div>
          <p>{t('recentTransactions.columns.type')}</p>
        </div>
        <div className="text-right">{t('recentTransactions.columns.total')}</div>
        <div className="text-right">{t('recentTransactions.columns.pending')}</div>
      </div>

      {lastFiveTransactions.map((tx) => (
        <div
          key={tx.id}
          className="grid grid-cols-[1fr_120px_120px] items-center gap-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {tEnums(`transactionType.${tx.transactionType}`)}
            </p>
            <p className="text-sm text-muted-foreground">{tx.no}</p>
          </div>

          <div className="text-right font-medium">
            {formatCurrency(
              Number(tx.totalAmount ? tx.totalAmount : tx?.paid ? tx?.paid : 0),
            )}
          </div>

          <div className="text-right font-medium">
            {formatCurrency(tx.pending)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentTransactionsTable
