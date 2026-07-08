import { UsersActionDialog } from './UserActionDialog'
import { useUsers } from './UserProvider'
import { UsersInviteDialog } from './UserInviteDialog'
import { UserResetPasswordDialog } from './UserResetPasswordDialog'

export function UsersDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useUsers()
    return (
        <>
            <UsersActionDialog
                key='user-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            <UsersInviteDialog
                key='user-invite'
                open={open === 'invite'}
                onOpenChange={() => setOpen('invite')}
            />

            {currentRow && (
                <>
                    <UsersActionDialog
                        key={`user-edit-${currentRow.id}`}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <UserResetPasswordDialog
                        key={`user-reset-${currentRow.id}`}
                        open={open === 'resetPassword'}
                        onOpenChange={() => {
                            setOpen('resetPassword')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />
                </>
            )}
        </>
    )
}
