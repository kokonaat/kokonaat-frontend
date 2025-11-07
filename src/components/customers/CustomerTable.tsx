import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerColumns as columns } from './CustomerColumns'
import { Input } from '@/components/ui/input'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'

import type { DataTablePropsInterface } from '@/interface/customerInterface'
import { DataTableBulkActions } from './DataTableBulkActions'
import { useDebounce } from '../../hooks/useDebounce'
import DateRangeSearch from '../DateRangeSearch'

const CustomerTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange
}: DataTablePropsInterface) => {
  // table states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    city: false,
    country: false,
    contactPerson: false,
    contactPersonPhone: false,
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Search states
  const [searchInput, setSearchInput] = useState('')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Debounce search input only (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300)

  const navigate = useNavigate()

  // Handle search input changes
  useEffect(() => {
    onPageChange(0) // Reset to first page
    onSearchChange?.(debouncedSearch, dateRange.from, dateRange.to)
  }, [debouncedSearch, onPageChange, onSearchChange, dateRange.from, dateRange.to])

  // Handle date range changes
  const handleDateChange = (from?: Date, to?: Date) => {
    setDateRange({ from, to })
    onPageChange(0) // Reset to first page when date range changes
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    // server-side pagination
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,

    // when user changes page
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },

    globalFilterFn: (row, _columnId, filterValue) => {
      const id = `des${row.index + 1}`.toLowerCase()
      const name = String(row.getValue('name')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return id.includes(searchValue) || name.includes(searchValue)
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // ensure current page is within range
  const pageCount = table.getPageCount()

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
      table.setPageIndex(pageCount - 1)
    }
  }, [table, pageCount])

  // customer transaction profile page
  const handleClick = (id: string) => {
    navigate(`/transactions/ledger/customer/${id}`)
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className='flex items-center justify-between'>
        <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-x-2">
            <DateRangeSearch onDateChange={handleDateChange} />
            <Input
              placeholder="Filter by id, name, phone or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>

          <div className="flex items-center">
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleClick(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  )
}

export default CustomerTable