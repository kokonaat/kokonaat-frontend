export interface TransactionMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: { id: string; title: string }
    onSave?: (updatedData: { title: string }) => void
}