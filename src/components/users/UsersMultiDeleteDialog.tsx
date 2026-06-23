import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTranslation } from '@/hooks/useTranslation'

type UserMultiDeleteDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function UsersMultiDeleteDialog<TData>({
    open,
    onOpenChange,
    table,
}: UserMultiDeleteDialogProps<TData>) {
    const { t } = useTranslation('users')
    const [value, setValue] = useState('')

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const entityKey = selectedRows.length > 1 ? 'entityPlural' : 'entitySingular'

    const handleDelete = () => {
        if (value.trim() !== CONFIRM_WORD) {
            toast.error(t('multiDelete.confirmPlaceholder'))
            return
        }

        onOpenChange(false)

        toast.promise(sleep(2000), {
            loading: t('multiDelete.loading'),
            success: () => {
                table.resetRowSelection()
                return t('multiDelete.success', {
                    count: selectedRows.length,
                    entity: t(`multiDelete.${entityKey}`),
                })
            },
            error: t('multiDelete.error'),
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== CONFIRM_WORD}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    {t('multiDelete.title', {
                        count: selectedRows.length,
                        entity: t(`multiDelete.${entityKey}`),
                    })}
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>{t('multiDelete.description')}</p>

                    <Label className='my-4 flex flex-col items-start gap-1.5'>
                        <span className=''>{t('multiDelete.confirmTyping')}</span>
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={t('multiDelete.confirmPlaceholder')}
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
