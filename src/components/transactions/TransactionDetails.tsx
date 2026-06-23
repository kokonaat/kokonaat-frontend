import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useTranslation } from '@/hooks/useTranslation'
import { useTransactionById } from "@/hooks/useTransaction"
import { useShopStore } from "@/stores/shopStore"
import { TransactionDetailsTable } from "./TransactionDetailsTable"
import { TransactionDetailsDownload } from "./TransactionDetailsDownload"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip"
import { Receipt, User, Calendar, CreditCard, FileText, DollarSign, CheckCircle2, Clock, Briefcase } from "lucide-react"
import { Badge } from "../ui/badge"

const TransactionDetails = () => {
    const { t } = useTranslation('transactions')
    const { t: tEnums } = useTranslation('enums')
    const { id } = useParams<{ id: string }>()
    const shopId = useShopStore((s) => s.currentShopId)
    const { data: transaction, isLoading, isError } = useTransactionById(shopId ?? "", id ?? "")

    if (isLoading) return <Main><p>{t('details.loading')}</p></Main>
    if (isError) return <Main><p className="text-red-500">{t('details.errorLoading')}</p></Main>

    if (!transaction) return <Main><p>{t('details.notFound')}</p></Main>

    const showDetailsTable = transaction.transactionType === "PURCHASE" || transaction.transactionType === "SALE"

    const notAvailable = t('table.columns.notAvailable')
    const name = transaction.vendor?.name ?? transaction.customer?.name ?? notAvailable
    const partnerType = transaction.vendor
        ? t('details.vendor')
        : transaction.customer
            ? t('details.customer')
            : notAvailable
    const paymentType = transaction.paymentType
        ? tEnums(`paymentType.${transaction.paymentType}`)
        : notAvailable
    const status = transaction.transactionStatus ?? notAvailable
    const isPaid = transaction.isPaid || transaction.pending === 0

    return (
        <Main>
            <div className="space-y-6">
                <Card className="rounded-2xl shadow-sm border bg-card">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Receipt className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>{t('details.title', { no: transaction.no })}</CardTitle>
                                    <CardDescription>
                                        {t('details.typeLabel')} {tEnums(`transactionType.${transaction.transactionType}`)}
                                    </CardDescription>
                                </div>
                            </div>
                            <TransactionDetailsDownload transaction={transaction} />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        {t('details.transactionInformation')}
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    {name && (
                                        <div className="flex items-start gap-3">
                                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">{partnerType}</p>
                                                <p className="text-sm font-medium">{name}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">{t('details.paymentType')}</p>
                                            <p className="text-sm font-medium">{paymentType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        {isPaid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">{t('details.status')}</p>
                                            <Badge 
                                                variant={isPaid ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        {t('details.financialDetails')}
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.totalAmount')}</p>
                                        <p className="text-sm font-medium">{transaction.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.paid')}</p>
                                        <p className="text-sm font-medium text-green-600">{transaction.paid.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.pending')}</p>
                                        <p className="text-sm font-medium text-amber-600">{transaction.pending.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        {t('details.timeline')}
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.createdAt')}</p>
                                        <p className="text-sm font-medium">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.updatedAt')}</p>
                                        <p className="text-sm font-medium">
                                            {new Date(transaction.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        {t('details.additionalInformation')}
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">{t('details.remarks')}</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="text-sm font-medium truncate cursor-help">
                                                        {transaction.remarks || notAvailable}
                                                    </p>
                                                </TooltipTrigger>
                                                {transaction.remarks && (
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="break-words">{transaction.remarks}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {showDetailsTable && (
                    <Card className="rounded-2xl shadow-sm border bg-card">
                        <CardHeader>
                            <CardTitle>{t('details.detailsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transaction.details?.length ? (
                                <TransactionDetailsTable data={transaction.details} />
                            ) : (
                                <p className="text-muted-foreground">{t('details.noDetails')}</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Main>
    )
}

export default TransactionDetails
