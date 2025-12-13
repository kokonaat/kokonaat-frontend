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
import { trackingColumns } from './InventoryTrackingColumns'
import { TransactionLedgerDataTablePagination } from '../customers/TransactionLedgerDataTablePagination'

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
    const table = useReactTable({
        data,
        columns: trackingColumns,
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

    return (
        <div className="space-y-4">
            {/* Table */}
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
                            table.getRowModel().rows.map((row) => (
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={trackingColumns.length}
                                    className="h-24 text-center"
                                >
                                    <Card className="m-4">
                                        <CardContent>
                                            <NoDataFound
                                                message="No tracking records found!"
                                                details="No tracking data available."
                                            />
                                        </CardContent>
                                    </Card>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* pagination */}
            {data.length > 0 && <TransactionLedgerDataTablePagination table={table} />}
        </div>
    )
}

export default InventoryDetailsTrackingTable