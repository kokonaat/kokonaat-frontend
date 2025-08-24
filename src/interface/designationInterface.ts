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
}

export interface DesignationFormInterface {
    title: string
}
