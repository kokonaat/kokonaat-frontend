import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { Customer } from '../../schema/customerSchema'

type CustomerViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: Customer | null
}

const CustomerViewDrawer = ({ open, onOpenChange, currentRow }: CustomerViewDrawerProps) => {
    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
                <DrawerHeader>
                    <DrawerTitle>Customer Details</DrawerTitle>
                    <DrawerDescription>View information for <strong>{currentRow.name}</strong></DrawerDescription>
                </DrawerHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">Name:</span> {currentRow.name}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Email:</span> {currentRow.email || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Phone:</span> {currentRow.phone || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Address:</span> {currentRow.address || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">City:</span> {currentRow.city || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Country:</span> {currentRow.country || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Contact Person:</span> {currentRow.contactPerson || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Contact Phone:</span> {currentRow.contactPersonPhone || '—'}
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

export default CustomerViewDrawer