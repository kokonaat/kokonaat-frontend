import { Table } from "@tanstack/react-table";

export interface Shop {
    id: string;
    name: string;
}

export interface VendorFormInterface {
  shop?: any;
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

export type VendorListInterface = Vendor[]

export interface VendorMutateDrawerProps {
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

export interface VendorMultiDeleteDialogProps<TData extends { id: string }> {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}