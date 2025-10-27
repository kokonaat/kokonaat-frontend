export interface InventoryItemInterface {
    id: string
    name: string
    no?: string
    price?: number
}

export interface InventoryItem {
    id: string       // Inventory unique ID
    name: string     // Inventory display name
    price?: number   // Optional price for the item
    stock?: number   // Optional stock quantity
    [key: string]: any // For any extra fields from API
}