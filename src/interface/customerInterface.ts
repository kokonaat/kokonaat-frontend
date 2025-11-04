export interface Shop {
  id: string;
  name: string;
}

export interface CustomerFormInterface {
  shop?: Shop;
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  city?: string | null;
  country?: string | null;
  isB2B?: boolean;
  contactPerson?: string | null;
  contactPersonPhone?: string | null;
  shopId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string | null;
  country: string | null;
  isB2B: boolean;
  contactPerson: string | null;
  contactPersonPhone: string | null;
  shop: Shop;
}

export type CustomerListInterface = Customer

export interface CustomerMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string
    city: string | null
    country: string | null
    isB2B: boolean
    contactPerson: string | null
    contactPersonPhone: string | null
  }
  onSave?: (updatedData: {
    name: string
    email: string | null
    phone: string
    address: string
    city: string | null
    country: string | null
    isB2B: boolean
    contactPerson: string | null
    contactPersonPhone: string | null
  }) => void
}

export interface DataTablePropsInterface {
  data: CustomerListInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string, startDate?: Date, endDate?: Date) => void
  rowSelection?: Record<string, boolean>
  dateRange?: { from?: Date; to?: Date }
}