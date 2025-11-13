import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./DataTableViewOption"
import { DataTablePagination } from "@/features/users/components/data-table-pagination"
import { TransactionColumns as columns } from "./TransactionColumns"
import type { Transaction } from "@/interface/transactionInterface"
import { DataTableBulkActions } from "../customers/DataTableBulkActions"
import DateRangeSearch from "../DateRangeSearch"
import { useDebounce } from "@/hooks/useDebounce"

interface TransactionTableProps {
  shopId: string
  data: Transaction[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string, startDate?: Date, endDate?: Date) => void
}

const TransactionTable = ({
  shopId: _shopId,
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange
}: TransactionTableProps) => {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Search states
  const [searchInput, setSearchInput] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Debounce search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300)

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

  const table = useReactTable<Transaction>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize }
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // transaction profile page
  const handleClick = (id: string) => {
    navigate(`/transactions/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
          <DateRangeSearch onDateChange={handleDateChange} />
          <Input
            placeholder="Filter transactions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>

        <div className="flex items-center">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  title="Click to view transaction ledger"
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleClick(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No transactions found.
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

export default TransactionTable