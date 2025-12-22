import { type ColumnDef } from '@tanstack/react-table'
import type { ExpenseReportItem, StockReportItem, StockTrackReportItem, TransactionLedgerDetailItem, TransactionReportItem } from '@/interface/reportInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

// cus/vend ledger table col
export const LedgerReportColumns: ColumnDef<TransactionLedgerDetailItem>[] = [
  {
    accessorKey: 'transactionNo',
    header: 'Ref No',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
  },
  {
    accessorKey: 'entityName',
    header: 'Party Name',
  },
  {
    accessorKey: 'inventoryName',
    header: 'Item',
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
  },
  {
    accessorFn: (row) => row.unitOfMeasurement?.name ?? '',
    id: 'uom',
    header: 'UOM',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => `৳${parseFloat(getValue() as string).toFixed(2)}`,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => `৳${parseFloat(getValue() as string).toFixed(2)}`,
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment',
  },
]

// transactoin report table col
export const TransactionReportColumns: ColumnDef<TransactionReportItem>[] = [
  {
    accessorKey: 'no',
    header: 'Transaction ID',
    cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: ({ getValue }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getValue() === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
        }`}>
        {getValue() as string}
      </span>
    ),
  },
  {
    id: 'party',
    header: 'Customer/Vendor',
    accessorFn: (row) => row.vendor?.name ?? row.customer?.name ?? 'N/A',
  },
  {
    id: "itemSummary",
    header: "Items",
    cell: ({ row }) => {
      const details = row.original.details || []

      const fullText = details
        .map(
          (d) =>
            `${d.inventory?.name ?? 'N/A'} (${d.quantity ?? 'N/A'} ${d.unitOfMeasurement?.name ?? 'N/A'})`
        )
        .join(", ")

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[250px] truncate text-xs text-muted-foreground cursor-help">
                {fullText || "N/A"}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">{fullText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ getValue }) => `৳${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ getValue }) => <span className="text-green-600">৳{Number(getValue()).toFixed(2)}</span>,
  },
  {
    accessorKey: 'pending',
    header: 'Due',
    cell: ({ getValue }) => (
      <span className={Number(getValue()) > 0 ? "text-destructive font-bold" : ""}>
        ৳{Number(getValue()).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'paymentType',
    header: 'Method',
  },
]

// expense report table col
export const ExpensesReportColumns: ColumnDef<ExpenseReportItem>[] = [
  {
    accessorKey: "title",
    header: "Title"
  },
  {
    accessorKey: "type",
    header: "Type"
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => `৳${Number(getValue()).toFixed(2)}`
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
]

// stock report table col
export const StocksReportColumns: ColumnDef<StockReportItem>[] = [
  {
    accessorKey: "no",
    header: "Ref No"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    accessorKey: "quantity",
    header: "Quantity"
  },
  {
    accessorFn: (row) => row.unitOfMeasurement?.name ?? 'N/A',
    id: "unitOfMeasurement",
    header: "UOM"
  },
  {
    accessorKey: "lastPrice",
    header: "Last Price",
    cell: ({ getValue }) => `৳${Number(getValue()).toFixed(2)}`
  },
]

// stock report tracking inventory table col
export const StockTrackReportColumns: ColumnDef<StockTrackReportItem>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
  {
    accessorKey: "isPurchased",
    header: "Type",
    cell: ({ row }) => {
      const isPurchased = row.original.isPurchased;
      const label = isPurchased ? "PURCHASE" : "SALE";

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPurchased
            ? 'bg-blue-100 text-blue-700'  // Style for PURCHASE
            : 'bg-orange-100 text-orange-700' // Style for SALE
          }`}>
          {label}
        </span>
      );
    }
  },
  {
    id: "inventory",
    header: "Item Name",
    accessorFn: (row) => row.inventory?.name ?? 'N/A',
  },
  {
    accessorKey: "stock",
    header: "Stock"
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => `৳${Number(getValue()).toFixed(2)}`
  },
]