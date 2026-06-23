import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
import { type User } from '../../features/users/data/schema'
import { UsersMultiDeleteDialog } from './UsersMultiDeleteDialog'
import { useTranslation } from '@/hooks/useTranslation'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation('users')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: status === 'active' ? t('bulkActions.activating') : t('bulkActions.deactivating'),
      success: () => {
        table.resetRowSelection()
        return status === 'active'
          ? t('bulkActions.activated', { count: selectedUsers.length })
          : t('bulkActions.deactivated', { count: selectedUsers.length })
      },
      error: status === 'active' ? t('bulkActions.activatingError') : t('bulkActions.deactivatingError'),
    })
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: t('bulkActions.inviting'),
      success: () => {
        table.resetRowSelection()
        return t('bulkActions.invited', { count: selectedUsers.length })
      },
      error: t('bulkActions.invitingError'),
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label={t('bulkActions.inviteSelected')}
              title={t('bulkActions.inviteSelected')}
            >
              <Mail />
              <span className='sr-only'>{t('bulkActions.inviteSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('bulkActions.inviteSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label={t('bulkActions.activateSelected')}
              title={t('bulkActions.activateSelected')}
            >
              <UserCheck />
              <span className='sr-only'>{t('bulkActions.activateSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('bulkActions.activateSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label={t('bulkActions.deactivateSelected')}
              title={t('bulkActions.deactivateSelected')}
            >
              <UserX />
              <span className='sr-only'>{t('bulkActions.deactivateSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('bulkActions.deactivateSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t('bulkActions.deleteSelected')}
              title={t('bulkActions.deleteSelected')}
            >
              <Trash2 />
              <span className='sr-only'>{t('bulkActions.deleteSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('bulkActions.deleteSelected')}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
