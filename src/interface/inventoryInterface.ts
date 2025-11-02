export interface InventoryItemInterface {
  id: string
  name: string
  description?: string
  quantity: number
  lastPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItem {
  id: string
  name: string
  price?: number
  stock?: number
}

export interface InventoryFormInterface {
  id?: string
  name: string
  description?: string
  quantity: number
  lastPrice: number
  shopId: string
}

export interface InventoryListItem {
  id: string
  name: string
  description?: string
  quantity: number
  lastPrice: number
  shopId: string
  createdAt?: string
  updatedAt?: string
}

export interface InventoryListApiResponseInterface {
  data: InventoryListResponseInterface
}

export interface InventoryListResponseInterface {
  data: InventoryListItem[]
  pagination: {
    total: number
    page: number
    limit: number
  }
}
export interface InventoryMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: InventoryFormInterface
  onSave?: (data: InventoryFormInterface) => void
}

export interface InventoryTableProps {
  data: InventoryItemInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (index: number) => void
  onSearchChange: (value: string) => void
}

export interface InventoryDetailInterface {
  no: string
  id: string
  name: string
  description: string
  quantity: string
  lastPrice: string
}

export interface InventoryItem {
  id: string;
  name: string;
  lastPrice: number;
  quantity: number; 
}