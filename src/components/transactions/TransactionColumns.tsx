import { type ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './DataTableRowActions'

export interface Transaction {
  id: string
  no: string
  partnerType: string
  transactionType: string
  vendor?: { name: string }
  customer?: { name: string }
  amount: number
  advancePaid: number
  pending: number
  transactionStatus: string | null
}

export const TransactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'no',
    header: 'No',
  },
  {
    accessorKey: 'partnerType',
    header: 'Partner Type',
  },
  {
    accessorKey: 'transactionType',
    header: 'Transaction Type',
  },
  {
    id: 'partnerName',
    header: 'Vendor / Customer Name',
    cell: ({ row }) => {
      const data = row.original
      return <div>{data.vendor?.name || data.customer?.name || '-'}</div>
    },
  },
  {
    id: 'amounts',
    header: 'Total / Paid / Pending',
    cell: ({ row }) => {
      const data = row.original
      return (
        <div>
          {data.amount} / {data.advancePaid} / {data.pending}
        </div>
      )
    },
  },
  {
    accessorKey: 'transactionStatus',
    header: 'Status',
    cell: ({ row }) => row.original.transactionStatus || 'N/A',
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]