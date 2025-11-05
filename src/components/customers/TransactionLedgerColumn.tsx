import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import type { TransactionLedgerInterface } from "@/interface/transactionInterface"

export const TransactionLedgerColumn: ColumnDef<TransactionLedgerInterface>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => row.original.no,
    },
    {
        accessorKey: "transactionType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.transactionType
            return (
                <Badge
                    variant={
                        type === "COMMISSION"
                            ? "default"
                            : type === "PAYMENT"
                                ? "secondary"
                                : "outline"
                    }
                >
                    {type}
                </Badge>
            )
        },
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => row.original.remarks || "—",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => `৳${row.original.amount.toLocaleString()}`,
    },
    {
        accessorKey: "paid",
        header: "Paid",
        cell: ({ row }) => `৳${row.original.paid.toLocaleString()}`,
    },
    {
        accessorKey: "advancePaid",
        header: "Advance Paid",
        cell: ({ row }) => `৳${row.original.advancePaid.toLocaleString()}`,
    },
    {
        accessorKey: "pending",
        header: "Pending",
        cell: ({ row }) => `৳${row.original.pending.toLocaleString()}`,
    },
    // devider
    {
        id: "divider",
        header: "",
        cell: () => (
            <div className="border-l border-gray-500 dark:border-gray-700 h-6 mx-2" />
        ),
        enableSorting: false,
        enableColumnFilter: false,
    },
    {
        accessorKey: "debit",
        header: "Debit",
        cell: ({ row }) => {
            const { transactionType, amount } = row.original
            const debitTypes = ["PURCHASE", "PAYMENT", "SALE", "COLLECT"]
            const debit = debitTypes.includes(transactionType) ? amount : 0
            return `৳${debit.toLocaleString()}`
        },
    },
    {
        accessorKey: "credit",
        header: "Credit",
        cell: ({ row }) => {
            const { transactionType, amount } = row.original
            const creditTypes = ["RECEIVABLE", "COMMISSION"]
            const credit = creditTypes.includes(transactionType) ? amount : 0
            return `৳${credit.toLocaleString()}`
        },
    },
    {
        accessorKey: "purchaseDetails",
        header: "Purchase Details",
        cell: ({ row }) => {
            if (row.original.transactionType !== "PURCHASE") return null

            const totalQty = row.original.details?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
            const totalPrice = row.original.details?.reduce((acc, item) => acc + item.total, 0) ?? 0

            return (
                <Accordion type="single" collapsible>
                    <AccordionItem value={`item-${row.original.id}`}>
                        <AccordionTrigger className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-md font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition">
                            Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-2">
                            {row.original.details?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition"
                                >
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        {item.inventory.name}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Qty: {item.quantity}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Price: ৳{item.price.toLocaleString()}
                                    </span>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">
                                        Total: ৳{item.total.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            {/* summery */}
                            <div className="flex justify-end gap-4 mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg font-semibold">
                                <span>Total Qty: {totalQty}</span>
                                <span>Total Price: ৳{totalPrice.toLocaleString()}</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )
        },
    }
]