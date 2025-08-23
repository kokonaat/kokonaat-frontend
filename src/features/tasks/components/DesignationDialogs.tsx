import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import DesignationsMutateDrawer from './DesignationsMutateDrawer'
import DesignationImportDialog from './DesignationImportDialog'
import { useTasks } from './tasks-provider'

const DesignationDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()
  return (
    <>
      <DesignationsMutateDrawer
        key='designation-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <DesignationImportDialog
        key='designations-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <DesignationsMutateDrawer
            key={`designation-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='designation-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following designation has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this designation: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a designation with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
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
