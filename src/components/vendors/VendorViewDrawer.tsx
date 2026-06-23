import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { Vendor } from '../../schema/vendorSchema'
import { useTranslation } from '@/hooks/useTranslation'

type VendorViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: Vendor | null
}

const VendorViewDrawer = ({ open, onOpenChange, currentRow }: VendorViewDrawerProps) => {
  const { t } = useTranslation('vendors')

  if (!currentRow) return null

  const empty = t('drawer.fields.emptyValue')

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>{t('drawer.viewTitle')}</DrawerTitle>
          <DrawerDescription>
            {t('drawer.viewDescription', { name: currentRow.name })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.name')}:</span> {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.email')}:</span> {currentRow.email || empty}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.phone')}:</span> {currentRow.phone || empty}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.city')}:</span> {currentRow.city || empty}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.country')}:</span> {currentRow.country || empty}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.contactPerson')}:</span> {currentRow.contactPerson || empty}
          </div>
          <div>
            <span className="font-medium text-foreground">{t('drawer.fields.contactPhone')}:</span> {currentRow.contactPersonPhone || empty}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default VendorViewDrawer
