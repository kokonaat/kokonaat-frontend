import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import ExpenseMutateDrawer from "./ExpenseMutateDrawer"
import ExpenseViewDrawer from "./ExpenseViewDrawer"
import { useDeleteExpense } from "@/hooks/useExpense"
import { useExpense } from "./expense-provider"
import { useDrawerStore } from "@/stores/drawerStore"
import { useShopStore } from "@/stores/shopStore"
import { useTranslation } from "@/hooks/useTranslation"

export default function ExpenseDialogs() {
    const { t } = useTranslation('expense')
    const { t: tToast } = useTranslation('toast')
    const { open, setOpen, currentRow, setCurrentRow } = useExpense()

    const shopId = useShopStore((s) => s.currentShopId)

    const deleteMutation = useDeleteExpense()
    const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

    return (
        <>
            <ExpenseMutateDrawer
                key="expense-create"
                open={open === "create"}
                onOpenChange={(val) => setOpen(val ? "create" : null)}
                onSave={() => setOpen(null)}
            />

            {currentRow && (
                <>
                    <ExpenseViewDrawer
                        key={`expense-view-${currentRow.id}`}
                        open={open === "view"}
                        onOpenChange={(val: boolean) => {
                            setOpen(val ? "view" : null)
                            setDrawerOpen(val)
                        }}
                        currentRow={currentRow}
                    />

                    <ExpenseMutateDrawer
                        key={`expense-update-${currentRow.id}`}
                        open={open === "update"}
                        onOpenChange={(val: boolean) => setOpen(val ? "update" : null)}
                        currentRow={{
                            ...currentRow,
                            shopId: currentRow.shopId ?? shopId ?? "",
                        }}
                        onSave={() => setOpen(null)}
                    />

                    <ConfirmDialog
                        key="expense-delete"
                        destructive
                        open={open === "delete"}
                        onOpenChange={(val: boolean) => setOpen(val ? "delete" : null)}
                        handleConfirm={() => {
                            if (!currentRow) return

                            deleteMutation.mutate(
                                { id: currentRow.id },
                                {
                                    onSuccess: () => {
                                        setOpen(null)
                                        setCurrentRow(null)
                                        toast.success(tToast('expense.deleted'))
                                    },
                                }
                            )
                        }}
                        className="max-w-md"
                        title={t('deleteDialog.title', { title: currentRow.title })}
                        desc={t('deleteDialog.description', { title: currentRow.title })}
                        confirmText={t('deleteDialog.confirm')}
                    />
                </>
            )}
        </>
    )
}
