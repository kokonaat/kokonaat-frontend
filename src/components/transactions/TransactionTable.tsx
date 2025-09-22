import { useState } from "react"
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
import { DataTablePagination } from "../designation/data-table-pagination"
import { DataTableBulkActions } from "../designation/data-table-bulk-actions"
import { DataTableViewOptions } from "./DataTableViewOption"
import { TransactionColumns as columns } from "./TransactionColumns"
import { useTransactionList } from "@/hooks/useTransaction"

interface TransactionTableProps {
  shopId: string
}

const TransactionTable = ({ shopId }: TransactionTableProps) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Fetch transactions from API (server-side pagination)
  const { data, isLoading, isError } = useTransactionList(shopId, pageIndex + 1)
  const transactions = data?.data || []
  const total = data?.total || 0
  const pageSize = 10

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, columnVisibility, columnFilters, globalFilter, pagination: { pageIndex, pageSize } },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newIndex = typeof updater === "function" ? updater({ pageIndex, pageSize }).pageIndex : updater.pageIndex
      setPageIndex(newIndex)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) return <div>Loading transactions...</div>
  if (isError) return <div>Failed to load transactions.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by title or ID..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-8 w-[250px]"
        />
        <DataTableViewOptions table={table} />
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
                <TableRow key={row.id}>
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