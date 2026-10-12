export interface UomInterface {
  id: string
  name: string
  description?: string
  shopId: string
  createdAt?: string
  updatedAt?: string
  baseQuantity?: number | null
  baseUom?: { id: string; name: string } | null
}

export interface UomFormInterface {
  id?: string
  name: string
  description?: string
  shopId: string
  baseQuantity?: number | null
  baseUomId?: string | null
}

export interface UomTableProps {
  data: UomInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (
    value?: string,
    from?: Date,
    to?: Date
  ) => void
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
  baseQuantity?: number | null
  baseUomId?: string | null
}
