import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDesignation, useUpdateDesignation } from '@/hooks/useDesignation'
import { useTasks } from '@/features/tasks/components/tasks-provider'
import DesignationsMutateDrawer from './DesignationsMutateDrawer'

const DesignationDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteDesignation(shopId || '')
  const updateMutation = useUpdateDesignation(shopId || '')

  return (
    <>
      {/* Create modal */}
      <DesignationsMutateDrawer
        key='designation-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* Update modal */}
          <DesignationsMutateDrawer
            key={`designation-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={(updatedData: { title: string }) => {
              if (!shopId || !currentRow) return
              updateMutation.mutate(
                { id: currentRow.id, data: updatedData },
                {
                  onSuccess: () => {
                    showSubmittedData(
                      updatedData,
                      'Designation updated successfully:'
                    )
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
          />

          {/* Delete modal */}
          <ConfirmDialog
            key='designation-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!shopId || !currentRow) return
              deleteMutation.mutate(currentRow.id, {
                onSuccess: () => {
                  showSubmittedData(
                    currentRow,
                    'The following designation has been deleted:'
                  )
                  setOpen(null)
                  setCurrentRow(null)
                },
              })
            }}
            className='max-w-md'
            title={`Delete this designation: ${currentRow.title} ?`}
            desc={
              <>
                You are about to delete a designation with the Title{' '}
                <strong>{currentRow.title}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}

export default DesignationDialogs