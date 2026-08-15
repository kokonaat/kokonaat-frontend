import { useState, useEffect, useMemo } from "react"
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type SortingState,
    type ColumnFiltersState,
    type ColumnDef,
} from "@tanstack/react-table"
import { useTranslation } from '@/hooks/useTranslation'
import { fmtAmount } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/features/users/components/data-table-view-options"
import { TransactionLedgerDataTablePagination } from "../customers/TransactionLedgerDataTablePagination"

interface TransactionDetail {
    id: string
    inventory?: { name?: string }
    quantity: number
    price: number
    total: number
    unitOfMeasurement?: { name?: string }
}

interface TransactionDetailsTableProps {
    data: TransactionDetail[]
    cnfCost?: number
    labourCost?: number
    transportCost?: number
    discount?: number
}

export const TransactionDetailsTable = ({ data, cnfCost = 0, labourCost = 0, transportCost = 0, discount = 0 }: TransactionDetailsTableProps) => {
    const { t } = useTranslation('transactions')
    const notAvailable = t('table.columns.notAvailable')

    const totalQty = data.reduce((sum, d) => sum + Number(d.quantity), 0)
    const totalExtraCosts = (cnfCost) + (labourCost) + (transportCost)
    const extraCostPerUnit = totalQty > 0 && totalExtraCosts > 0 ? totalExtraCosts / totalQty : 0
    const hasExtraCosts = totalExtraCosts > 0

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pageIndex, setPageIndex] = useState(0)
    const pageSize = 10

    const columns: ColumnDef<TransactionDetail>[] = useMemo(
        () => [
            {
                header: t('details.detailsTable.columns.item'),
                accessorKey: "inventory.name",
                cell: (info) => info.row.original.inventory?.name ?? notAvailable,
            },
            {
                header: t('details.detailsTable.columns.uom'),
                accessorKey: "unitOfMeasurement.name",
                cell: (info) => info.row.original.unitOfMeasurement?.name ?? notAvailable,
            },
            { header: t('details.detailsTable.columns.qty'), accessorKey: "quantity" },
            {
                header: t('details.detailsTable.columns.price'),
                accessorKey: "price",
                cell: (info) => `${info.getValue<number>()}`,
            },
            ...(hasExtraCosts ? [{
                id: "landedCost",
                header: t('details.detailsTable.columns.landedCost'),
                cell: ({ row }: { row: { original: TransactionDetail } }) =>
                    fmtAmount(Number(row.original.price) + extraCostPerUnit, { min: 2 }),
            } as ColumnDef<TransactionDetail>] : []),
            {
                header: t('details.detailsTable.columns.total'),
                accessorKey: "total",
                cell: (info) => `${info.getValue<number>()}`,
            },
        ],
        [t, notAvailable, hasExtraCosts, extraCostPerUnit]
    )

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
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater({ pageIndex, pageSize })
                setPageIndex(newState.pageIndex)
            } else {
                setPageIndex(updater.pageIndex)
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, _colId, filterValue) => {
            const search = String(filterValue).toLowerCase()
            return !!(
                row.original.inventory?.name?.toLowerCase().includes(search) ||
                String(row.original.price).includes(search) ||
                String(row.original.total).includes(search) ||
                row.original.unitOfMeasurement?.name?.toLowerCase().includes(search)
            )
        },
    })

    const pageCount = table.getPageCount()
    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount) {
            table.setPageIndex(pageCount - 1)
        }
    }, [table, pageCount])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder={t('details.detailsTable.filterPlaceholder')}
                    value={globalFilter}
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
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('details.detailsTable.empty')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <TransactionLedgerDataTablePagination table={table} />

            {discount > 0 && (
                <div className="flex justify-end pt-2 border-t">
                    <p className="text-sm text-red-600">
                        {t('details.discount')}: <span className="font-semibold">-{fmtAmount(discount)}</span>
                    </p>
                </div>
            )}
        </div>
    )
}
