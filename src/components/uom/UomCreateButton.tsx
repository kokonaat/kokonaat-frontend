import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUom } from './uom-provider'
import { useTranslation } from '@/hooks/useTranslation'

const UomCreateButton = () => {
  const { t } = useTranslation('uom')
  const { setOpen } = useUom()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('buttons.create')}</span> <Plus size={18} />
      </Button>
    </div>
  )
}

export default UomCreateButton
