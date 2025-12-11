import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { useTrackInventoryById } from '@/hooks/useInventory'
import { useShopStore } from '@/stores/shopStore'
import type { InventoryItemInterface } from '@/interface/inventoryInterface'
import InventoryDetailsTrackingTable from './InventoryDetailsTrackingTable'
import { NoDataFound } from '../NoDataFound'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

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
  // Hooks MUST run unconditionally
  const shopId = useShopStore((s) => s.currentShopId)

  const inventoryId = currentRow?.id ?? ''

  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading, isError } = useTrackInventoryById(
    inventoryId,
    shopId,
    pageIndex + 1,
    pageSize
  )

  // Now we can safely stop UI rendering
  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto p-6 space-y-6">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">
            Inventory Details
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            View information for{' '}
            <span className="font-medium">{currentRow.name}</span>
          </DrawerDescription>
        </DrawerHeader>

        {/* Inventory Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Name:</span>{' '}
            {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">Quantity:</span>{' '}
            {currentRow.quantity}
          </div>
          <div>
            <span className="font-medium text-foreground">Description:</span>{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[200px] truncate cursor-help">
                    {currentRow.description || '—'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs wrap-break-word">
                    {currentRow.description || '—'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <span className="font-medium text-foreground">Last Price:</span> ৳
            {currentRow.lastPrice}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <h3 className="text-md font-semibold mb-2">Inventory Tracking</h3>

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading tracking data...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500">Error loading tracking data</p>
        )}

        {!isLoading && data && data.items.length === 0 && (
          <NoDataFound message="No tracking records found!" />
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