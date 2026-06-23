import ContentSection from '@/features/settings/components/content-section'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { useUser } from '@/hooks/useUser'
import { Main } from '../layout/main'
import { useTranslation } from '@/hooks/useTranslation'

const UserProfile = () => {
    const { t } = useTranslation('users')
    const { data: user } = useUser()

    if (!user) {
        return (
            <ContentSection title={t('profile.title')} desc=''>
                <div className='text-muted-foreground'>{t('page.loading')}</div>
            </ContentSection>
        )
    }

    return (
        <Main>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h2>
            </div>
            <div className='space-y-6 mt-5'>
                <div className='space-y-2'>
                    <div className='text-lg font-medium'>{user.name}</div>
                    <div className='text-sm text-muted-foreground'>{user.phone}</div>
                    <div className='text-sm text-muted-foreground'>
                        {format(new Date(user.createdAt), 'PPpp')}
                    </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                    {user.shopWiseUserRoles?.length === 0 ? null : (
                        user.shopWiseUserRoles.map((shopRole) => (
                            <div
                                key={shopRole.id}
                                className='p-4 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center'
                            >
                                <div>
                                    <div className='font-medium'>{shopRole.shop?.name}</div>
                                    <div className='text-sm text-muted-foreground'>
                                        {shopRole.role.name.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Main>
    )
}

export default UserProfile
