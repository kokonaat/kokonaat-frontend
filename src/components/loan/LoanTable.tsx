import { useEffect, useState } from 'react'
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
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useLoanColumns } from './LoanColumns'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import DateRangeSearch from '../DateRangeSearch'
import { NoDataFound } from '../NoDataFound'
import type { LoanTableProps } from '@/interface/loanInterface'
import type { DateRange } from 'react-day-picker'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslation } from '@/hooks/useTranslation'

const LoanTable = ({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onSearchChange,
    onDateChange,
    defaultDateRange,
}: LoanTableProps) => {
    const { t } = useTranslation('loans')
    const columns = useLoanColumns()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 300)

    useEffect(() => {
        onPageChange(0)
        onSearchChange?.(debouncedSearch)
    }, [debouncedSearch, onPageChange, onSearchChange])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            globalFilter,
            pagination: { pageIndex, pageSize },
        },
        manualPagination: true,
        pageCount: Math.ceil(total / pageSize),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
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
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const pageCount = table.getPageCount()
    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount) {
            table.setPageIndex(Math.max(0, pageCount - 1))
        }
    }, [table, pageCount])

    return (
        <div className='space-y-4'>
            <div className='flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex flex-col gap-2 md:flex-row md:items-center gap-x-2'>
                    <DateRangeSearch value={defaultDateRange as DateRange | undefined} onDateChange={onDateChange} />
                    <Input
                        placeholder={t('table.searchPlaceholder')}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className='h-8 w-[150px] lg:w-[250px]'
                    />
                </div>
                <DataTableViewOptions table={table} />
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                                                message={t('table.emptyMessage')}
                                                details={t('table.emptyDetails')}
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
        </div>
    )
}

export default LoanTable
