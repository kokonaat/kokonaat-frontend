import { NoDataFound } from "../NoDataFound"

interface Transaction {
  id: string
  no: string
  partnerType: "CUSTOMER" | "VENDOR"
  transactionType: "SALE" | "PURCHASE"
  totalAmount: number
  pending: number
  createdAt: string
  partnerName?: string
  avatar?: string
}

interface RecentTransactionsTableProps {
  data:
  | {
    recentTransactions: Transaction[]
  }
  | undefined
}

const RecentTransactionsTable = ({ data }: RecentTransactionsTableProps) => {
  // handles undefined or data
  const transactions = data?.recentTransactions || []

  const lastFiveTransactions = transactions.slice(0, 5)

  if (lastFiveTransactions.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Recent Transactions"
          details="Create a transaction to get started."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div>
            <p>Type</p>
          </div>
          <div>Total</div>
          <div>Pending</div>
        </div>
      </div>

      {lastFiveTransactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-4">
          <div className="flex flex-1 flex-wrap items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">
                {tx.transactionType}
              </p>
              <p className="text-muted-foreground text-sm">{tx.no}</p>
            </div>

            <div className="font-medium">
              ৳{Number(tx?.totalAmount ?? 0).toLocaleString()}
            </div>

            <div className="font-medium">
              ৳{tx.pending.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentTransactionsTable