import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { InventoryItemInterface } from '@/interface/inventoryInterface'

type InventoryViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: InventoryItemInterface | null
}

const InventoryViewDrawer = ({ open, onOpenChange, currentRow }: InventoryViewDrawerProps) => {
  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>Inventory Details</DrawerTitle>
          <DrawerDescription>
            View information for <strong>{currentRow.name}</strong>
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Name:</span> {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">Description:</span> {currentRow.description || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Quantity:</span> {currentRow.quantity ?? '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Last Price:</span> {currentRow.lastPrice ?? '—'}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default InventoryViewDrawer