import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useShopStore } from '@/stores/shopStore'
import { generateTransactionDetailsPDF } from '@/utils/enums/transactionDetailsPdf'
import type { Transaction } from '@/interface/transactionInterface'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
    transaction: Transaction
}

export const TransactionDetailsDownload = ({ transaction }: Props) => {
    const { t } = useTranslation('transactions')
    const { t: tExport } = useTranslation('export')
    const { t: tToast } = useTranslation('toast')
    const { currentShopName } = useShopStore()
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentShopName) {
            toast.error(tToast('transaction.shopNameMissing'))
            return
        }

        try {
            setIsDownloading(true)
            await generateTransactionDetailsPDF(tExport, transaction, currentShopName)
            toast.success(tToast('transaction.transactionReportDownloaded'))
        } catch (error) {
            console.error('Download error:', error)
            toast.error(tToast('transaction.transactionReportFailed'))
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="default"
            className="gap-2"
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {t('buttons.downloadPdf')}
        </Button>
    )
}
