import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import LoanMutateDrawer from "./LoanMutateDrawer"
import LoanPayDrawer from "./LoanPayDrawer"
import { useDeleteLoan } from "@/hooks/useLoan"
import { useLoanContext } from "./loan-provider"
import { useTranslation } from "@/hooks/useTranslation"

export default function LoanDialogs() {
    const { t } = useTranslation('loans')
    const { t: tToast } = useTranslation('toast')
    const { open, setOpen, currentRow, setCurrentRow } = useLoanContext()

    const deleteMutation = useDeleteLoan()

    return (
        <>
            <LoanMutateDrawer
                key="loan-create"
                open={open === "create"}
                onOpenChange={(val) => setOpen(val ? "create" : null)}
                onSave={() => setOpen(null)}
            />

            {currentRow && (
                <>
                    <LoanMutateDrawer
                        key={`loan-update-${currentRow.id}`}
                        open={open === "update"}
                        onOpenChange={(val) => setOpen(val ? "update" : null)}
                        currentRow={currentRow}
                        onSave={() => setOpen(null)}
                    />

                    <LoanPayDrawer
                        key={`loan-pay-${currentRow.id}`}
                        open={open === "pay"}
                        onOpenChange={(val) => {
                            setOpen(val ? "pay" : null)
                            if (!val) setCurrentRow(null)
                        }}
                        currentRow={currentRow}
                        onSave={() => {
                            setOpen(null)
                            setCurrentRow(null)
                        }}
                    />

                    <ConfirmDialog
                        key="loan-delete"
                        destructive
                        open={open === "delete"}
                        onOpenChange={(val) => setOpen(val ? "delete" : null)}
                        handleConfirm={() => {
                            if (!currentRow) return
                            deleteMutation.mutate(
                                { id: currentRow.id },
                                {
                                    onSuccess: () => {
                                        setOpen(null)
                                        setCurrentRow(null)
                                        toast.success(tToast('loan.deleted') || "Loan deleted")
                                    },
                                }
                            )
                        }}
                        className="max-w-md"
                        title={t('deleteDialog.title', { no: currentRow.no })}
                        desc={t('deleteDialog.description', { loanFrom: currentRow.loanFrom })}
                        confirmText={t('deleteDialog.confirm')}
                    />
                </>
            )}
        </>
    )
}
