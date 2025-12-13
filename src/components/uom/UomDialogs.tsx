import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
// import { useDrawerStore } from '@/stores/drawerStore'
import { useUom } from './uom-provider'
import UomMutateDrawer from './UomMutateDrawer'
// import UomViewDrawer from './UomViewDrawer'
import { useDeleteUom } from '@/hooks/useUom'
import { useShopStore } from '@/stores/shopStore'

const UomDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useUom()

  const shopId = useShopStore(s => s.currentShopId)!
  const deleteMutation = useDeleteUom(shopId)

  // const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      {/* Create */}
      <UomMutateDrawer
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          {/* View */}
          {/* <UomViewDrawer
            open={open === 'view'}
            onOpenChange={(val) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          /> */}

          {/* Update */}
          <UomMutateDrawer
            open={open === 'update'}
            onOpenChange={(val) => setOpen(val ? 'update' : null)}
            currentRow={{
              id: currentRow.id,
              name: currentRow.name,
              description: currentRow.description,
              shopId: currentRow.shopId,
            }}
            onSave={() => setOpen(null)}
          />

          {/* Delete */}
          <ConfirmDialog
            destructive
            open={open === 'delete'}
            onOpenChange={(val) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentRow) return

              deleteMutation.mutate(
                { id: currentRow.id },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                    toast.success('UOM deleted successfully')
                  },
                }
              )
            }}
            title={`Delete this UOM: ${currentRow.name}?`}
            desc={
              <>
                You are about to delete <strong>{currentRow.name}</strong>.
                <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}

export default UomDialogs