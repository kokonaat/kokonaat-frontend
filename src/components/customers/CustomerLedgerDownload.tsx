import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'
import type { Customer } from '@/interface/customerInterface'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    customer: Customer
}

export const CustomerLedgerDownload = ({ customer }: Props) => {
    const { t } = useTranslation('customers')
    const { t: tExport } = useTranslation('export')
    const { t: tToast } = useTranslation('toast')
    const { currentShopId, currentShopName } = useShopStore()

    const { isLoading, refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        customer.id,
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

        try {
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning(tToast('customer.noTransactions'))
                return
            }

            const entity: Entity = {
                name: customer.name,
                no: customer.no ?? undefined,
                email: customer.email ?? undefined,
                phone: customer.phone ?? undefined,
                address: customer.address ?? undefined,
                city: customer.city ?? undefined,
                country: customer.country ?? undefined,
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

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('ledger.downloadAriaLabel')}
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
