import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { VendorColumns as columns } from './VendorColumns'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '../data-table-pagination'
import { VendorTableBulkActions } from './VendorTableBulkActions'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import type { DataTablePropsInterface, Vendor } from '@/interface/vendorInterface'
import { useDebounce } from '../../hooks/useDebounce'
import DateRangeSearch from '../DateRangeSearch'
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'

const VendorTable = ({
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

  // Handle search input and date range changes
  useEffect(() => {
    onPageChange(0) // Reset to first page
    onSearchChange?.(debouncedSearch, dateRange.from, dateRange.to)
  }, [debouncedSearch, onPageChange, onSearchChange, dateRange.from, dateRange.to])

  // Handle date range changes
  const handleDateChange = (from?: Date, to?: Date) => {
    setDateRange({ from, to })
    onPageChange(0) // Reset to first page when date range changes
  }

  const table = useReactTable<Vendor>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize }
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: updater => {
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

  const pageCount = table.getPageCount()

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
      table.setPageIndex(pageCount - 1)
    }
  }, [table, pageCount])

  // vendor transaction profile page
  const handleClick = (id: string) => {
    navigate(`/transactions/ledger/vendor/${id}`)
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className='flex items-center justify-between'>
        <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
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
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  title="Click to view vendor ledger"
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleClick(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
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
                        message='No Vendor found!'
                        details="Create a vendor first."
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
      <VendorTableBulkActions table={table} />
    </div>
  )
}

export default VendorTable