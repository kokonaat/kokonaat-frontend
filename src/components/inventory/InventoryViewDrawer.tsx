import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTrackInventoryById } from '@/hooks/useInventory'
import { useShopStore } from '@/stores/shopStore'
import type { InventoryItemInterface } from '@/interface/inventoryInterface'
import InventoryDetailsTrackingTable from './InventoryDetailsTrackingTable'
import { NoDataFound } from '../NoDataFound'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'sonner'
import { generateInventoryTrackingPDF } from '@/utils/enums/inventoryTrackingReportPdf'
import { useTranslation } from '@/hooks/useTranslation'

type InventoryViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: InventoryItemInterface | null
}

const InventoryViewDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: InventoryViewDrawerProps) => {
  const { t } = useTranslation('inventory')
  const { t: tExport } = useTranslation('export')
  const { t: tToast } = useTranslation('toast')
  const shopId = useShopStore((s) => s.currentShopId)
  const shopName = useShopStore((s) => s.currentShopName)

  const inventoryId = currentRow?.id ?? ''

  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading, isError } = useTrackInventoryById(
    inventoryId,
    shopId,
    pageIndex + 1,
    pageSize,
    { enabled: open && !!inventoryId && !!shopId }
  )

  const handleDownloadPDF = async () => {
    if (!currentRow || !data || data.items.length === 0) {
      toast.error(tToast('inventory.noTrackingData'))
      return
    }

    try {
      await generateInventoryTrackingPDF(
        tExport,
        {
          no: currentRow.no || t('viewDrawer.notAvailable'),
          name: currentRow.name,
          description: currentRow.description,
          quantity: currentRow.quantity,
          lastPrice: currentRow.lastPrice,
          unitOfMeasurement: currentRow.unitOfMeasurement,
        },
        data.items,
        shopName || tExport('common.fallbacks.shopName'),
      )
      toast.success(tToast('inventory.pdfDownloaded'))
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error(tToast('inventory.pdfFailed'))
    }
  }

  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto p-6 space-y-6">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold">
                {t('viewDrawer.title')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                {t('viewDrawer.description', { name: currentRow.name })}
              </DrawerDescription>
            </div>

            {data && data.items.length > 0 && (
              <Button
                onClick={handleDownloadPDF}
                variant="default"
                size="sm"
                className="gap-2"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                {t('buttons.downloadPdf')}
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">{t('viewDrawer.name')}</span>{' '}
            {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('viewDrawer.stockInHand')}</span>{' '}
            {currentRow.quantity} {currentRow.unitOfMeasurement?.name || ' '}
          </div>
          <div className='flex gap-1'>
            <span className="font-medium text-foreground">{t('viewDrawer.descriptionLabel')}</span>{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-50 truncate cursor-help">
                    {currentRow.description || t('viewDrawer.notAvailable')}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs wrap-break-word">
                    {currentRow.description || t('viewDrawer.notAvailable')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <span className="font-medium text-foreground">{t('viewDrawer.lastPrice')}</span>{' '}
            {currentRow.lastPrice}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <h3 className="text-md font-semibold mb-2">{t('viewDrawer.tracking')}</h3>

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            {t('viewDrawer.loadingTracking')}
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500">{t('viewDrawer.errorTracking')}</p>
        )}

        {!isLoading && data && data.items.length === 0 && (
          <NoDataFound message={t('viewDrawer.emptyTracking')} />
        )}

        {!isLoading && data && data.items.length > 0 && (
          <InventoryDetailsTrackingTable
            data={data.items}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={data.total}
            onPageChange={(newPage) => setPageIndex(newPage)}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default InventoryViewDrawer
