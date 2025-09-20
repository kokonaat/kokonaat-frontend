import type { Table } from "@tanstack/react-table";

export interface Shop {
  id: string;
  name: string;
}

export interface VendorFormInterface {
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

export interface Vendor {
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

export interface VendorListResponseInterface {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorListApiResponseInterface {
  msg: string;
  statusCode: number;
  data: VendorListResponseInterface;
}

export interface VendorMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Vendor
  onSave?: (updatedData: VendorFormInterface) => void
}

export interface VendorMultiDeleteDialogProps<TData extends { id: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export interface DataTablePropsInterface {
  data: Vendor[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}