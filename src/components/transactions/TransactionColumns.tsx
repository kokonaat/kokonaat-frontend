import { Link } from "react-router-dom"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "./DataTableRowActions"

export interface Transaction {
  id: string
  no: string
  partnerType: string
  transactionType: string
  vendor?: { id: string; name: string }
  customer?: { id: string; name: string }
  amount: number
  advancePaid: number
  pending: number
  transactionStatus: string | null
}

export const TransactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "no",
    header: "No",
  },
  {
    accessorKey: "partnerType",
    header: "Partner Type",
  },
  {
    accessorKey: "transactionType",
    header: "Transaction Type",
  },
  {
    id: "partnerName",
    header: "Vendor/Customer Name",
    cell: ({ row }) => {
      const data = row.original

      const handleLinkClick = (e: React.MouseEvent) => {
        // prevent triggering row click
        e.stopPropagation()
      }

      if (data.vendor) {
        return (
          <Link
            to={`/vendor/${data.vendor.id}`}
            onClick={handleLinkClick}
            className="text-blue-600 hover:underline font-medium"
          >
            {data.vendor.name}
          </Link>
        )
      }

      if (data.customer) {
        return (
          <Link
            to={`/customer/${data.customer.id}`}
            onClick={handleLinkClick}
            className="text-blue-600 hover:underline font-medium"
          >
            {data.customer.name}
          </Link>
        )
      }
      return <span className="text-gray-500">-</span>
    },
  },
  {
    id: "amounts",
    header: "Total / Paid / Pending",
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
    accessorKey: "transactionStatus",
    header: "Status",
    cell: ({ row }) => row.original.transactionStatus || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]