import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Download, Loader2, Wallet, HandCoins } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/hooks/useTranslation'
import { useTransactions } from './transaction-provider'
import type { Transaction } from '@/interface/transactionInterface'
import { useShopStore } from '@/stores/shopStore'
import { useTransactionLedger } from '@/hooks/useTransaction'
import { generatePDF } from '@/utils/enums/pdf'
import type { Entity } from '@/utils/enums/pdf'

type TransactionRowActionsProps = {
  row: Row<Transaction>
}

const hasPendingBalance = (transaction: Transaction) =>
  Number(transaction.pending ?? 0) > 0

export const canPayVendor = (transaction: Transaction) =>
  !!(transaction.vendor?.id || transaction.vendorId) &&
  hasPendingBalance(transaction) &&
  transaction.transactionType !== 'PAYMENT'

export const canCollectPayment = (transaction: Transaction) =>
  !!(transaction.customer?.id || transaction.customerId) &&
  hasPendingBalance(transaction) &&
  transaction.transactionType !== 'RECEIVABLE'

export function TransactionRowActions({ row }: TransactionRowActionsProps) {
  const { t } = useTranslation('transactions')
  const { t: tExport } = useTranslation('export')
  const { t: tToast } = useTranslation('toast')
  const { t: tEnums } = useTranslation('enums')
  const transaction = row.original
  const { setOpen, setCurrentRow, setRecordPaymentMode } = useTransactions()
  const { currentShopId, currentShopName } = useShopStore()
  const [isDownloading, setIsDownloading] = useState(false)

  const entityId = transaction.vendor?.id || transaction.customer?.id
  const entityName = transaction.vendor?.name || transaction.customer?.name
  const entityType = transaction.vendor ? 'VENDOR' : 'CUSTOMER'

  const { refetch } = useTransactionLedger(
    currentShopId ?? '',
    1,
    entityId ?? '',
    10,
    undefined,
    undefined,
    undefined,
    { enabled: false },
  )

  const showPay = canPayVendor(transaction)
  const showCollect = canCollectPayment(transaction)
  const showDownload = !!entityId

  const handlePay = (e: Event) => {
    e.stopPropagation()
    setCurrentRow(transaction)
    setRecordPaymentMode('pay')
    setOpen('recordPayment')
  }

  const handleCollect = (e: Event) => {
    e.stopPropagation()
    setCurrentRow(transaction)
    setRecordPaymentMode('collect')
    setOpen('recordPayment')
  }

  const handleDownload = async (e: Event) => {
    e.stopPropagation()

    if (!currentShopId) {
      toast.error(tToast('transaction.shopIdMissing'))
      return
    }

    if (!entityId) {
      toast.error(tToast('transaction.noPartner'))
      return
    }

    setIsDownloading(true)
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
        shop: {
          name: currentShopName || 'Shop',
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

  if (!showPay && !showCollect && !showDownload) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">{t('rowActions.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {showPay && (
          <DropdownMenuItem className="cursor-pointer" onSelect={handlePay}>
            <Wallet className="mr-2 h-4 w-4" />
            {t('rowActions.payVendor')}
          </DropdownMenuItem>
        )}
        {showCollect && (
          <DropdownMenuItem className="cursor-pointer" onSelect={handleCollect}>
            <HandCoins className="mr-2 h-4 w-4" />
            {t('rowActions.collectPayment')}
          </DropdownMenuItem>
        )}
        {showDownload && (showPay || showCollect) && <DropdownMenuSeparator />}
        {showDownload && (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isDownloading}
            onSelect={handleDownload}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('buttons.downloadPdf')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
