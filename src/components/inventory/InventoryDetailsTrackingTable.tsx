import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
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
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'
import type { InventoryTrackingItemInterface } from '@/interface/inventoryInterface'
import { useInventoryTrackingColumns } from './InventoryTrackingColumns'
import { TransactionLedgerDataTablePagination } from '../customers/TransactionLedgerDataTablePagination'
import { useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

type InventoryDetailsTrackingTableProps = {
    data: InventoryTrackingItemInterface[]
    pageIndex: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
}

const InventoryDetailsTrackingTable = ({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
}: InventoryDetailsTrackingTableProps) => {
    const { t } = useTranslation('inventory')
    const { t: tReports } = useTranslation('reports')
    const columns = useInventoryTrackingColumns()

    const table = useReactTable({
        data,
        columns,
        state: { pagination: { pageIndex, pageSize } },
        manualPagination: true,
        pageCount: Math.ceil(total / pageSize),
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
            onPageChange(newPagination.pageIndex)
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const subtotals = useMemo(() => {
        const totalPurchased = data.reduce(
            (sum, item) => sum + (item.isPurchased ? item.stock : 0),
            0
        )
        const totalSold = data.reduce(
            (sum, item) => sum + (!item.isPurchased ? item.stock : 0),
            0
        )
        const netStock = totalPurchased - totalSold

        return { totalPurchased, totalSold, netStock }
    }, [data])

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {data.length > 0 ? (
                            <>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="cursor-default">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}

                                <TableRow className="bg-slate-50 font-semibold border-t-2 border-slate-300">
                                    <TableCell className="text-right" colSpan={1}>
                                        {t('trackingTable.columns.stock')}:
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="text-green-600">
                                                {tReports('summaryCards.totalIn')}: {subtotals.totalPurchased}
                                            </span>
                                            <span className="text-muted-foreground">/</span>
                                            <span className="text-red-600">
                                                {tReports('summaryCards.totalOut')}: {subtotals.totalSold}
                                            </span>
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-bold ${subtotals.netStock >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {subtotals.netStock >= 0 ? '+' : ''}{subtotals.netStock}
                                        </span>
                                    </TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <Card className="m-4">
                                        <CardContent>
                                            <NoDataFound
                                                message={t('trackingTable.emptyMessage')}
                                            />
                                        </CardContent>
                                    </Card>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {data.length > 0 && <TransactionLedgerDataTablePagination table={table} />}
        </div>
    )
}

export default InventoryDetailsTrackingTable
