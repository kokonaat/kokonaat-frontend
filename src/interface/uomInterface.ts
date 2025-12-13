export interface UomInterface {
  id: string
  name: string
  description?: string
  shopId: string
  createdAt?: string
  updatedAt?: string
}

export interface UomFormInterface {
  id?: string
  name: string
  description?: string
  shopId: string
}

export interface UomTableProps {
  data: UomInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (index: number) => void
  onSearchChange: (value: string) => void
}

export interface UomMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: UomFormInterface
  onSave?: (data: UomFormInterface) => void
}

export interface CreateUomFormInterface {
  name: string
  description?: string
  shopId: string
}
