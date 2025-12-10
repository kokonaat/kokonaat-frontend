import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { useTrackInventoryById } from '@/hooks/useInventory'
import { useShopStore } from '@/stores/shopStore'
import type { InventoryItemInterface, InventoryTrackingItemInterface } from '@/interface/inventoryInterface'
import { NoDataFound } from '../NoDataFound'

type InventoryViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: InventoryItemInterface | null
}

const InventoryViewDrawer = ({ open, onOpenChange, currentRow }: InventoryViewDrawerProps) => {
  const inventoryId = currentRow?.id ?? ''
  const shopId = useShopStore((s) => s.currentShopId)

  const { data, isLoading, isError } = useTrackInventoryById(inventoryId, shopId, 1, 10)

  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto p-6 space-y-6">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">Inventory Details</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            View information for <span className="font-medium">{currentRow.name}</span>
          </DrawerDescription>
        </DrawerHeader>

        {/* Inventory Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div><span className="font-medium text-foreground">Name:</span> {currentRow.name}</div>
          <div><span className="font-medium text-foreground">Quantity:</span> {currentRow.quantity}</div>
          <div><span className="font-medium text-foreground">Description:</span> {currentRow.description || '—'}</div>
          <div><span className="font-medium text-foreground">Last Price:</span> ৳{currentRow.lastPrice}</div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Inventory Tracking Table */}
        <h3 className="text-md font-semibold mb-2">Inventory Tracking</h3>

        {isLoading && <p className="text-sm text-muted-foreground">Loading tracking data...</p>}
        {isError && <p className="text-sm text-red-500">Error loading tracking data</p>}
        {!isLoading && data && data.items.length === 0 && <NoDataFound message='No tracking records found!' />}
        {!isLoading && data && data.items.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items.map((item: InventoryTrackingItemInterface, index: number) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100 transition-colors' : 'hover:bg-gray-100 transition-colors'}
                  >
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-700">{item.inventory.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600">{item.stock}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600">৳{item.price}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default InventoryViewDrawer