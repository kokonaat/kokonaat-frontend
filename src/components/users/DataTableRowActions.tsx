import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { KeyRound, Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsers } from './UserProvider'
import type { UserListItem } from '@/interface/userInterface'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsShopOwner } from '@/hooks/useShopPermissions'
import { useUserStore } from '@/stores/userStore'

interface DataTableRowActionsProps<TData extends UserListItem> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends UserListItem>({
    row,
}: DataTableRowActionsProps<TData>) {
    const { t } = useTranslation('common')
    const { t: tUsers } = useTranslation('users')
    const { setOpen, setCurrentRow } = useUsers()
    const isShopOwner = useIsShopOwner()
    const currentUserId = useUserStore((s) => s.user?.id)

    if (!isShopOwner || row.original.id === currentUserId) {
        return null
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(row.original)
                        setOpen('edit')
                    }}
                >
                    {t('actions.edit')}
                    <DropdownMenuShortcut>
                        <UserPen size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(row.original)
                        setOpen('resetPassword')
                    }}
                >
                    {tUsers('resetPasswordDialog.menuLabel')}
                    <DropdownMenuShortcut>
                        <KeyRound size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(row.original)
                        setOpen('delete')
                    }}
                    className='text-red-500'
                >
                    {t('actions.delete')}
                    <DropdownMenuShortcut>
                        <Trash2 size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
