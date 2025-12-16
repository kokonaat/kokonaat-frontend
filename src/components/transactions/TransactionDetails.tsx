import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTransactionById } from "@/hooks/useTransaction"
import { useShopStore } from "@/stores/shopStore"
import { TransactionDetailsTable } from "./TransactionDetailsTable"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

const TransactionDetails = () => {
    const { id } = useParams<{ id: string }>()
    const shopId = useShopStore((s) => s.currentShopId)
    const { data: transaction, isLoading, isError } = useTransactionById(shopId ?? "", id ?? "")

    if (isLoading) return <Main><p>Loading transaction details...</p></Main>
    if (isError) return <Main><p className="text-red-500">Failed to load transaction.</p></Main>

    if (!transaction) return <Main><p>No transaction found.</p></Main>

    const showDetailsTable = transaction.transactionType === "PURCHASE" || transaction.transactionType === "SALE"

    return (
        <Main>
            <Card className="rounded-2xl shadow-sm border bg-card">
                <CardHeader>
                    <CardTitle>Transaction #{transaction.no}</CardTitle>
                    <CardDescription>Type: {transaction.transactionType}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {transaction.vendor?.name ?? transaction.customer?.name}</p>
                            <p><strong>Amount:</strong> ৳{transaction.totalAmount}</p>
                            <p><strong>Advance Paid:</strong> ৳{transaction.advancePaid}</p>
                            <p><strong>Paid:</strong> ৳{transaction.paid}</p>
                            <p><strong>Pending:</strong> ৳{transaction.pending}</p>
                        </div>

                        <div className="space-y-2">
                            <p><strong>Payment Type:</strong> {(transaction.paymentType ?? "N/A").replace("_", " ")}</p>
                            <p><strong>Status:</strong> {transaction.transactionStatus ?? "Pending"}</p>
                            {/* <p><strong>Partner Type:</strong> {transaction.partnerType}</p> */}
                            <p><strong>Created At:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
                            <p><strong>Updated At:</strong> {new Date(transaction.updatedAt).toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                                <strong>Remarks:</strong>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="truncate max-w-[200px] block">
                                            {transaction.remarks || "N/A"}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs wrap-break-word">
                                        {transaction.remarks || "N/A"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {
                        showDetailsTable ? <Separator /> : ""
                    }

                    {/* Details */}
                    {showDetailsTable && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
                            {transaction.details?.length ? (
                                <TransactionDetailsTable data={transaction.details} />
                            ) : (
                                <p>No details found.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Main>
    )
}

export default TransactionDetails