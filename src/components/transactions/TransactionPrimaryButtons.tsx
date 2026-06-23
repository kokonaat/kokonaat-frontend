import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useTransactions } from './transaction-provider'

const TransactionPrimaryButtons = () => {
  const { t } = useTranslation('transactions')
  const { setOpen } = useTransactions()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('buttons.create')}</span> <Plus size={18} />
      </Button>
    </div>
  )
}

export default TransactionPrimaryButtons
