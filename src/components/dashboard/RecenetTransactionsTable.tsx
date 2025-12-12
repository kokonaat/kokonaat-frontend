import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
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
  data: {
    recentTransactions: Transaction[]
  }
}

const RecentTransactionsTable = ({ data }: RecentTransactionsTableProps) => {
  const transactions = data?.recentTransactions || []

  if (transactions.length === 0) {
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
    <Table className="w-full">
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              {/* transaction no */}
              <TableCell className="py-3 px-4 font-medium flex flex-col gap-1">
                <span>{tx.transactionType}</span>
                <span>{tx.no}</span>
              </TableCell>

              {/* amount */}
              <TableCell className="py-3 px-4 text-right font-medium text-green-700">
                ৳{Number(tx?.totalAmount ?? 0).toLocaleString()}
              </TableCell>

              {/* pending */}
              <TableCell className="py-3 px-4 text-right font-medium text-red-600">
                ৳{tx.pending.toLocaleString()}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              No recent transactions.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default RecentTransactionsTable