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
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'

// extended interface to accept initialDateRange
interface CustomerTableProps extends DataTablePropsInterface {
  initialDateRange?: { from: Date; to: Date }
}

const CustomerTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
  initialDateRange,
}: CustomerTableProps) => {
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
  // Initialize with default date range
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    initialDateRange || {}
  )
  // Track if date range is actively selected
  const [isDateRangeActive, setIsDateRangeActive] = useState(true)

  // Debounce search input only (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300)

  const navigate = useNavigate()

  // Handle search input changes - clear date range when searching
  useEffect(() => {
    onPageChange(0) // Reset to first page
    
    if (debouncedSearch) {
      // If there's a search query, don't send date range
      onSearchChange?.(debouncedSearch, undefined, undefined)
      setIsDateRangeActive(false)
    } else if (isDateRangeActive && dateRange.from && dateRange.to) {
      // If no search query and date range is active, send date range
      onSearchChange?.(undefined, dateRange.from, dateRange.to)
    } else {
      // If no search and no active date range, send nothing
      onSearchChange?.(undefined, undefined, undefined)
    }
  }, [debouncedSearch, isDateRangeActive, dateRange.from, dateRange.to, onPageChange, onSearchChange])

  // Handle date range changes from the date picker
  const handleDateChange = (from?: Date, to?: Date) => {
    setDateRange({ from, to })
    setIsDateRangeActive(!!(from && to)) // Mark date range as active if both dates exist
    
    // Clear search input when date range is selected
    if (from && to && searchInput) {
      setSearchInput('')
    }
    
    onPageChange(0) // Reset to first page when date range changes
  }

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // When user starts typing, deactivate date range
    if (value) {
      setIsDateRangeActive(false)
    } else {
      // When search is cleared, reactivate date range if it exists
      setIsDateRangeActive(!!(dateRange.from && dateRange.to))
    }
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
          <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
            {/* Pass value prop to show selected date range */}
            <DateRangeSearch 
              onDateChange={handleDateChange}
              value={isDateRangeActive && dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
            {/* Use custom handler instead of direct onChange */}
            <Input
              placeholder="Filter by id, name, phone or address..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="h-8 w-37.5 lg:w-62.5"
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
                  title="Click to view customer ledger"
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
                  <Card className='m-4'>
                    <CardContent>
                      <NoDataFound
                        message='No Customer found!'
                        details="Create a customer first."
                      />
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > 0 && <DataTablePagination table={table} />}
      <DataTableBulkActions table={table} />
    </div>
  )
}

export default CustomerTable