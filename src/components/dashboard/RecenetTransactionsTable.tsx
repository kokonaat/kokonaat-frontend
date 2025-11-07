import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Transaction {
  id: string
  no: string
  partnerType: "CUSTOMER" | "VENDOR"
  transactionType: "SALE" | "PURCHASE"
  amount: number
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

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-auto">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="py-2 px-4 text-left">Transaction No</TableHead>
            <TableHead className="py-2 px-4 text-left">Partner</TableHead>
            <TableHead className="py-2 px-4 text-left">Type</TableHead>
            <TableHead className="py-2 px-4 text-right">Amount</TableHead>
            <TableHead className="py-2 px-4 text-right">Pending</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
              >
                {/* transaction no */}
                <TableCell className="py-3 px-4 font-medium">{tx.no}</TableCell>

                {/* partner */}
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {tx.avatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tx.avatar} alt={tx.partnerName || tx.partnerType} />
                        <AvatarFallback>{tx.partnerName?.slice(0, 2).toUpperCase() || tx.partnerType.slice(0,2)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{tx.partnerName || tx.partnerType}</span>
                      <span className="text-xs text-muted-foreground">{tx.partnerType}</span>
                    </div>
                  </div>
                </TableCell>

                {/* transaction type */}
                <TableCell className="py-3 px-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      tx.transactionType === "SALE"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tx.transactionType}
                  </span>
                </TableCell>

                {/* amount */}
                <TableCell className="py-3 px-4 text-right font-medium text-green-700">
                  ৳{tx.amount.toLocaleString()}
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
    </div>
  )
}

export default RecentTransactionsTable