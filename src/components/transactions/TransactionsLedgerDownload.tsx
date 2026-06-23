import { Download, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import type { Transaction } from '@/interface/transactionInterface'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'

interface Props {
    transaction: Transaction
}

export const TransactionsLedgerDownload = ({ transaction }: Props) => {
    const { t } = useTranslation('transactions')
    const { t: tExport } = useTranslation('export')
    const { t: tToast } = useTranslation('toast')
    const { t: tEnums } = useTranslation('enums')
    const { currentShopId, currentShopName } = useShopStore()

    const entityId = transaction.vendor?.id || transaction.customer?.id
    const entityName = transaction.vendor?.name || transaction.customer?.name
    const entityType = transaction.vendor ? 'VENDOR' : 'CUSTOMER'

    const { isLoading, refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        entityId ?? '',
        10,
        undefined,
        undefined,
        undefined,
        { enabled: false },
    )

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopId) {
            toast.error(tToast('transaction.shopIdMissing'))
            return
        }

        if (!entityId) {
            toast.error(tToast('transaction.noPartner'))
            return
        }

        try {
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning(
                    tToast('transaction.noTransactionsForPartner', {
                        partnerType: tEnums(`partnerType.${entityType}`),
                    })
                )
                return
            }

            const entity: Entity = {
                name: entityName || 'Unknown',
                no: undefined,
                email: undefined,
                phone: undefined,
                address: undefined,
                city: undefined,
                country: undefined,
                shop: {
                    name: currentShopName || 'Shop',
                    address: undefined,
                },
            }

            await generatePDF(tExport, entity, ledgerData.transactions, {
                totalAmount: ledgerData.totalAmount || 0,
                totalPaid: ledgerData.paid || 0,
            })

            toast.success(tToast('transaction.ledgerDownloaded'))
        } catch (error) {
            console.error('Download error:', error)
            toast.error(tToast('transaction.ledgerDownloadFailed'))
        }
    }

    if (!entityId) {
        return null
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('buttons.downloadPdf')}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Download className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('buttons.downloadPdf')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
