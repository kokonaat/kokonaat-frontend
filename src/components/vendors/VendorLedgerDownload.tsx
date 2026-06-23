import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import type { Vendor } from '@/interface/vendorInterface'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    vendor: Vendor
}

export const VendorLedgerDownload = ({ vendor }: Props) => {
    const { t } = useTranslation('vendors')
    const { t: tExport } = useTranslation('export')
    const { t: tToast } = useTranslation('toast')
    const { currentShopId, currentShopName } = useShopStore()
    const [isDownloading, setIsDownloading] = useState(false)

    const { refetch } = useTransactionLedger(
        currentShopId ?? '',
        1,
        vendor.id,
        10,
        undefined,
        undefined,
        undefined,
        { enabled: false }
    )

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopId) {
            toast.error(tToast('transaction.shopIdMissing'))
            return
        }

        setIsDownloading(true)

        try {
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning(tToast('vendor.noTransactions'))
                return
            }

            const entity: Entity = {
                name: vendor.name,
                no: vendor.no ?? undefined,
                email: vendor.email ?? undefined,
                phone: vendor.phone ?? undefined,
                address: vendor.address ?? undefined,
                city: vendor.city ?? undefined,
                country: vendor.country ?? undefined,
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
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('buttons.downloadPdf')}
                    >
                        {isDownloading ? (
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
