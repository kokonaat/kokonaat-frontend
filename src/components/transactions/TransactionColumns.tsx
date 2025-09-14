import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DesignationInterface } from '@/interface/designationInterface'
import { DataTableColumnHeader } from './DataTableColHeader'
import { DataTableRowActions } from './DataTableRowActions'

export const TransactionColumns: ColumnDef<DesignationInterface>[] = [
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

  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='ID' />
  //   ),
  //   cell: ({ row }) => {
  //     const fullId = row.getValue('id') as string
  //     const shortId = `${fullId.slice(0, 6)}...${fullId.slice(-4)}`

  //     const [copied, setCopied] = useState(false)

  //     const handleCopy = async () => {
  //       try {
  //         await navigator.clipboard.writeText(fullId)
  //         setCopied(true)
  //         setTimeout(() => setCopied(false), 2000)
  //       } catch {
  //         // handle error
  //       }
  //     }

  //     return (
  //       <div className='flex items-center gap-2'>
  //         <Tooltip>
  //           <TooltipTrigger>
  //             <span className='truncate max-w-[90px] cursor-pointer text-gray-800 dark:text-gray-200 hover:underline'>
  //               {shortId}
  //             </span>
  //           </TooltipTrigger>
  //           <TooltipContent>
  //             <p>{fullId}</p>
  //           </TooltipContent>
  //         </Tooltip>

  //         <button
  //           onClick={handleCopy}
  //           className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition'
  //           title='Copy full ID'
  //         >
  //           {copied ? (
  //             <CheckIcon className='w-4 h-4 text-green-500' />
  //           ) : (
  //             <ClipboardIcon className='w-4 h-4 text-gray-500' />
  //           )}
  //         </button>
  //       </div>
  //     )
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const serialNumber = row.index + 1
      return <div>{`des${serialNumber}`}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    // cell: ({ row }) => {
    //   const label = labels.find((label) => label.value === row.original.label)

    //   return (
    //     <div className='flex space-x-2'>
    //       {label && <Badge variant='outline'>{label.label}</Badge>}
    //       <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
    //         {row.getValue('title')}
    //       </span>
    //     </div>
    //   )
    // },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]