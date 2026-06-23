import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExpense } from './expense-provider'
import { useTranslation } from '@/hooks/useTranslation'

const ExpenseCreateButton = () => {
    const { t } = useTranslation('expense')
    const { setOpen } = useExpense()

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpen('create')}>
                <span>{t('buttons.create')}</span> <Plus size={18} />
            </Button>
        </div>
    )
}

export default ExpenseCreateButton
