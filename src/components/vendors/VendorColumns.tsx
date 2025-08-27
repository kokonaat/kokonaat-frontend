import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardIcon, CheckIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { DesignationInterface } from '@/interface/designationInterface'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'

export const VendorColumns: ColumnDef<DesignationInterface>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='ID' />
  //   ),
  //   cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const fullId = row.getValue('id') as string
      const shortId = `${fullId.slice(0, 6)}...${fullId.slice(-4)}`

      const [copied, setCopied] = useState(false)

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(fullId)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // handle error
        }
      }

      return (
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger>
              <span className='truncate max-w-[90px] cursor-pointer text-gray-800 dark:text-gray-200 hover:underline'>
                {shortId}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullId}</p>
            </TooltipContent>
          </Tooltip>

          <button
            onClick={handleCopy}
            className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition'
            title='Copy full ID'
          >
            {copied ? (
              <CheckIcon className='w-4 h-4 text-green-500' />
            ) : (
              <ClipboardIcon className='w-4 h-4 text-gray-500' />
            )}
          </button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='City' />
    ),
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Country' />
    ),
  },
  {
    accessorKey: 'isB2B',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IsB2B' />
    ),
  },
  {
    accessorKey: 'contactPerson',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Person' />
    ),
  },
  {
    accessorKey: 'contactPersonPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Person Phone' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]