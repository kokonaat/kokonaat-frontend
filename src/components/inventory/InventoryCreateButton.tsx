import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInventory } from './inventory-provider'
import { useTranslation } from '@/hooks/useTranslation'

const InventoryCreateButton = () => {
  const { t } = useTranslation('inventory')
  const { setOpen } = useInventory()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('buttons.create')}</span> <Plus size={18} />
      </Button>
    </div>
  )
}

export default InventoryCreateButton
