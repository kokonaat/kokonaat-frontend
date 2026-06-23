import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomers } from './customer-provider'
import { useTranslation } from '@/hooks/useTranslation'

const CustomerCreateButton = () => {
  const { setOpen } = useCustomers()
  const { t } = useTranslation('customers')

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('buttons.create')}</span> <Plus size={18} />
      </Button>
    </div>
  )
}

export default CustomerCreateButton
