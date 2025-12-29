import { Download, Loader2 } from 'lucide-react'
import { useShopStore } from '@/stores/shopStore'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'
import type { Transaction } from '@/interface/transactionInterface'
import { Button } from '@/components/ui/button'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { toast } from 'sonner'

interface Props {
    transaction: Transaction
}

export const TransactionsLedgerDownload = ({ transaction }: Props) => {
    const { currentShopId, currentShopName } = useShopStore()

    // Determine which entity (vendor or customer) this transaction belongs to
    const entityId = transaction.vendor?.id || transaction.customer?.id
    const entityName = transaction.vendor?.name || transaction.customer?.name
    const entityType = transaction.vendor ? 'vendor' : 'customer'

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
            toast.error('Shop ID is missing')
            return
        }

        if (!entityId) {
            toast.error('No vendor or customer associated with this transaction')
            return
        }

        try {
            // Fetch latest data
            const { data: ledgerData } = await refetch()

            if (!ledgerData?.transactions?.length) {
                toast.warning(`No transactions found for this ${entityType}`)
                return
            }

            // Prepare entity data for PDF
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

            // Generate PDF
            generatePDF(entity, ledgerData.transactions, {
                totalAmount: ledgerData.totalAmount || 0,
                totalPaid: ledgerData.paid || 0,
            })

            toast.success('Ledger report downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download ledger report. Please try again.')
        }
    }

    // Don't show button if there's no vendor or customer
    if (!entityId) {
        return null
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant="default"
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Download PDF
        </Button>
    )
}