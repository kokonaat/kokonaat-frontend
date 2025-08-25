export interface DesignationInterface {
    // [x: string]: string
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
