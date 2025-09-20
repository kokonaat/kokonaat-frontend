import type { Table } from "@tanstack/react-table"

export interface DesignationInterface {
    id: string
    title: string
    createdAt: string
    updatedAt: string | null
    shop: {
        id: string
        name: string
    }
}

export interface DesignationMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: { id: string; title: string }
    onSave?: (updatedData: { title: string }) => void
}

export interface DesignationFormInterface {
    title: string
}

export interface TaskMultiDeleteDialogProps<TData extends { id: string }> {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

export interface DesignationDataTableProps {
    data: DesignationInterface[]
  }
  
