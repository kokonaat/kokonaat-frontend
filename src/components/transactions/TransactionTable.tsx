import { useEffect, useMemo, useRef, useState } from "react"
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
import { Card, CardContent } from "../ui/card"
import { DataTableViewOptions } from "./DataTableViewOption"
import { DataTablePagination } from "./DataTablePagination"
import { TransactionColumns as columns } from "./TransactionColumns"
import type { Transaction } from "@/interface/transactionInterface"
import { DataTableBulkActions } from "../customers/DataTableBulkActions"
import DateRangeSearch from "../DateRangeSearch"
import { useDebounce } from "@/hooks/useDebounce"
import { NoDataFound } from "../NoDataFound"
import { Combobox } from "../ui/combobox"
import { TRANSACTION_TYPES } from "@/constance/transactionConstances"
import { useVendorList } from "@/hooks/useVendor"
import { useCustomerList } from "@/hooks/useCustomer"
import { useShopStore } from "@/stores/shopStore"

interface TransactionTableProps {
  shopId: string
  data: Transaction[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string, startDate?: Date, endDate?: Date) => void
  onFiltersChange?: (transactionTypes: string[], vendorIds: string[], customerIds: string[]) => void
}

const TransactionTable = ({
  shopId: _shopId,
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
  onFiltersChange
}: TransactionTableProps) => {
  const navigate = useNavigate()
  const shopId = useShopStore((s) => s.currentShopId) ?? ""
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Search states
  const [searchInput, setSearchInput] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Filter states
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("")
  const [selectedVendorId, setSelectedVendorId] = useState<string>("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [vendorSearch, setVendorSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")

  // Fetch vendors and customers for comboboxes
  const { data: vendorResponse } = useVendorList(shopId, 1, 50, vendorSearch)
  const { data: customerResponse } = useCustomerList(shopId, 1, 50, customerSearch)

  // Memoized options for comboboxes
  const transactionTypeOptions = useMemo(() => 
    [{ value: "", label: "All Types" }, ...TRANSACTION_TYPES.map(t => ({ value: t.value, label: t.label }))],
    []
  )

  const vendorOptions = useMemo(() => {
    const options = vendorResponse?.data?.map(v => ({ value: v.id, label: v.name })) || []
    return [{ value: "", label: "All Vendors" }, ...options]
  }, [vendorResponse])

  const customerOptions = useMemo(() => {
    const options = customerResponse?.customers?.map(c => ({ value: c.id, label: c.name })) || []
    return [{ value: "", label: "All Customers" }, ...options]
  }, [customerResponse])

  // Debounce search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Track if this is the initial render
  const isFirstRender = useRef(true)
  const prevSearchRef = useRef(debouncedSearch)
  const prevDateFromRef = useRef(dateRange.from)
  const prevDateToRef = useRef(dateRange.to)
  const prevTransactionTypeRef = useRef(selectedTransactionType)
  const prevVendorIdRef = useRef(selectedVendorId)
  const prevCustomerIdRef = useRef(selectedCustomerId)

  // Handle search input and date range changes - only reset page when values change
  useEffect(() => {
    // On initial render, just update refs without resetting page
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevSearchRef.current = debouncedSearch
      prevDateFromRef.current = dateRange.from
      prevDateToRef.current = dateRange.to
      return
    }

    // Only reset page if search or date values actually changed
    const searchChanged = prevSearchRef.current !== debouncedSearch
    const dateFromChanged = prevDateFromRef.current !== dateRange.from
    const dateToChanged = prevDateToRef.current !== dateRange.to

    if (searchChanged || dateFromChanged || dateToChanged) {
      onPageChange(0) // Reset to first page only when search/date changes
      onSearchChange?.(debouncedSearch, dateRange.from, dateRange.to)

      // Update refs
      prevSearchRef.current = debouncedSearch
      prevDateFromRef.current = dateRange.from
      prevDateToRef.current = dateRange.to
    }
  }, [debouncedSearch, onPageChange, onSearchChange, dateRange.from, dateRange.to])

  // Handle filter changes
  useEffect(() => {
    const typeChanged = prevTransactionTypeRef.current !== selectedTransactionType
    const vendorChanged = prevVendorIdRef.current !== selectedVendorId
    const customerChanged = prevCustomerIdRef.current !== selectedCustomerId

    if (typeChanged || vendorChanged || customerChanged) {
      const types = selectedTransactionType ? [selectedTransactionType] : []
      const vendors = selectedVendorId ? [selectedVendorId] : []
      const customers = selectedCustomerId ? [selectedCustomerId] : []
      onFiltersChange?.(types, vendors, customers)

      // Update refs
      prevTransactionTypeRef.current = selectedTransactionType
      prevVendorIdRef.current = selectedVendorId
      prevCustomerIdRef.current = selectedCustomerId
    }
  }, [selectedTransactionType, selectedVendorId, selectedCustomerId, onFiltersChange])

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
      <div className="flex flex-1 flex-col gap-y-2">
        {/* First row: Date range, search input, and view options */}
        <div className="flex flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Second row: Filter comboboxes */}
        <div className="flex flex-wrap gap-2 items-center">
          <Combobox
            options={transactionTypeOptions}
            placeholder="Transaction Type"
            emptyMessage="No types found"
            value={selectedTransactionType}
            onSelect={setSelectedTransactionType}
            className="h-8 w-[160px]"
          />
          <Combobox
            options={vendorOptions}
            placeholder="Vendor"
            emptyMessage="No vendors found"
            value={selectedVendorId}
            onSelect={setSelectedVendorId}
            onSearch={setVendorSearch}
            className="h-8 w-[160px]"
          />
          <Combobox
            options={customerOptions}
            placeholder="Customer"
            emptyMessage="No customers found"
            value={selectedCustomerId}
            onSelect={setSelectedCustomerId}
            onSearch={setCustomerSearch}
            className="h-8 w-[160px]"
          />
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
                  <Card className="m-4">
                    <CardContent>
                      <NoDataFound
                        message="No Transaction found!"
                        details="Create a Transaction first."
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

export default TransactionTable