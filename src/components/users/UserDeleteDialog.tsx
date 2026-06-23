'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from './ShowSubmittedData'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { UserListItem } from '@/interface/userInterface'
import { useTranslation } from '@/hooks/useTranslation'

type UserDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: UserListItem
}

export function UsersDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: UserDeleteDialogProps) {
    const { t } = useTranslation('users')
    const [value, setValue] = useState('')

    const handleDelete = () => {
        if (value.trim() !== currentRow.name) return

        onOpenChange(false)
        showSubmittedData(currentRow, t('deleteDialog.successMessage'))
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.name}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    {t('deleteDialog.title')}
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        {t('deleteDialog.description', { name: currentRow.name })}
                    </p>

                    <Label className='my-2'>
                        {t('deleteDialog.usernameLabel')}
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={t('deleteDialog.usernamePlaceholder')}
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>{t('deleteDialog.warningTitle')}</AlertTitle>
                        <AlertDescription>
                            {t('deleteDialog.warningDescription')}
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={t('buttons.delete')}
            destructive
        />
    )
}
