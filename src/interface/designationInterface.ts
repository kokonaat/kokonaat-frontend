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