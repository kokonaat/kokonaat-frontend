import type { ColumnDef } from '@tanstack/react-table'
import type { TransactionLedgerInterface } from '@/interface/transactionInterface'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export const TransactionLedgerColumn: ColumnDef<TransactionLedgerInterface>[] =
  [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.original.no,
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.transactionType
        return (
          <Badge
            variant={
              type === 'COMMISSION'
                ? 'default'
                : type === 'PAYMENT'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const text = row.getValue('remarks') as string || null
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className='max-w-[200px] truncate'>{text ?? 'N/A'}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className='max-w-sm wrap-break-word'>{text ?? 'N/A'}</div>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = Number(row.original.totalAmount ?? 0)
        return `৳${amount.toLocaleString()}`
      },
    },
    {
      accessorKey: 'paid',
      header: 'Paid',
      cell: ({ row }) => `৳${row.original.paid.toLocaleString()}`,
    },
    {
      accessorKey: 'advancePaid',
      header: 'Advance Paid',
      cell: ({ row }) => `৳${row.original.advancePaid.toLocaleString()}`,
    },
    {
      accessorKey: 'pending',
      header: 'Pending',
      cell: ({ row }) => `৳${row.original.pending.toLocaleString()}`,
    },
    // devider
    {
      id: 'divider',
      header: '',
      cell: () => (
        <div className='mx-2 h-6 border-l border-gray-500 dark:border-gray-700' />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'details',
      header: 'Transaction Details',
      cell: ({ row }) => {
        const type = row.original.transactionType
        const detailsLabel = type === 'PURCHASE' ? 'Purchase Details' : 'Sales Details'

        const totalQty =
          row.original.details?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
        const totalPrice =
          row.original.details?.reduce((acc, item) => acc + item.total, 0) ?? 0

        return (
          <Accordion type='single' collapsible>
            <AccordionItem value={`item-${row.original.id}`}>
              <AccordionTrigger className='rounded-md bg-blue-100 px-4 py-2 font-medium transition hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800'>
                {detailsLabel}
              </AccordionTrigger>
              <AccordionContent className='space-y-2 p-4'>
                {row.original.details?.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded-lg bg-white p-2 shadow-sm transition hover:shadow-md dark:bg-gray-800'
                  >
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>
                      {item.inventory.name}
                    </span>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Qty: {item.quantity}
                    </span>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Price: ৳{item.price.toLocaleString()}
                    </span>
                    <span className='font-medium text-gray-700 dark:text-gray-200'>
                      Total: ৳{item.total.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* summary */}
                <div className='mt-2 flex justify-end gap-4 rounded-lg bg-gray-50 p-2 font-semibold dark:bg-gray-900'>
                  <span>Total Qty: {totalQty}</span>
                  <span>Total Price: ৳{totalPrice.toLocaleString()}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      },
    }
  ]
