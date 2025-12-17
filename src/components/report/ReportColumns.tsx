import { type ColumnDef } from '@tanstack/react-table'
import type { TransactionLedgerDetailItem } from '@/interface/reportInterface'

export const ReportColumns: ColumnDef<TransactionLedgerDetailItem>[] = [
    {
        accessorKey: 'transactionNo',
        header: 'Transaction No',
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
        header: 'Customer/Vendor',
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