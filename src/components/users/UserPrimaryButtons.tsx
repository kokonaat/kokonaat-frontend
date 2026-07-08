import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './UserProvider'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsShopOwner } from '@/hooks/useShopPermissions'

export function UsersPrimaryButtons() {
    const { t } = useTranslation('users')
    const { setOpen } = useUsers()
    const isShopOwner = useIsShopOwner()

    if (!isShopOwner) {
        return null
    }

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpen('add')}>
                <span>{t('buttons.addUser')}</span> <UserPlus size={18} />
            </Button>
        </div>
    )
}
