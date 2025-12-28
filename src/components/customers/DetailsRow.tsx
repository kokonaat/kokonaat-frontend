import type { TransactionLedgerInterface } from '@/interface/transactionInterface'

export function DetailsRow({
    row,
}: {
    row: TransactionLedgerInterface
}) {
    const totalQty =
        row.details?.reduce((acc, item) => acc + item.quantity, 0) ?? 0

    const totalPrice =
        row.details?.reduce((acc, item) => acc + item.total, 0) ?? 0

    return (
        <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            {row.details?.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800"
                >
                    <span className="font-semibold">
                        {item.inventory.name}
                    </span>

                    <span>
                        Qty: {item.quantity} {item.unitOfMeasurement?.name ?? ''}
                    </span>

                    <span>
                        Price: ৳{item.price.toLocaleString()}
                    </span>

                    <span className="font-medium">
                        Total: ৳{item.total.toLocaleString()}
                    </span>
                </div>
            ))}

            <div className="flex justify-end gap-4 font-semibold">
                <span>Total Qty: {totalQty}</span>
                <span>Total Price: ৳{totalPrice.toLocaleString()}</span>
            </div>
        </div>
    )
}