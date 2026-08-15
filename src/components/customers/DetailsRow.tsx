import type { TransactionLedgerInterface } from '@/interface/transactionInterface'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmtAmount } from '@/lib/utils'

export function DetailsRow({
    row,
}: {
    row: TransactionLedgerInterface
}) {
    if (!row.details || row.details.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-2">
                No details available
            </div>
        )
    }

    const discount = Number(row.discount) || 0

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/30">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Inventory</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {row.details.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.inventory?.name ?? 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {fmtAmount(item.quantity || 0, { min: 2, max: 2 })} {item.unitOfMeasurement?.name ?? ''}
                                </TableCell>
                                <TableCell className="text-right">
                                    {fmtAmount(item.price || 0)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {fmtAmount(item.total || 0)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {discount > 0 && (
                <div className="flex justify-end pr-2">
                    <p className="text-sm text-red-600">
                        Discount: <span className="font-semibold">-{fmtAmount(discount)}</span>
                    </p>
                </div>
            )}
        </div>
    )
}