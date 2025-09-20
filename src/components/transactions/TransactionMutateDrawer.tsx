import { useState, useEffect } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Combobox } from '../ui/combobox'
import { Checkbox } from '@/components/ui/checkbox'
import { getCurrentShopId } from '@/lib/getCurrentShopId'
import type { ComboboxOptionInterface, TransactionMutateDrawerProps, TransactionRowInterface } from '@/interface/transactionInterface'
import type { Customer } from '@/interface/customerInterface'
import type { Vendor } from '@/interface/vendorInterface'
import { CUSTOMER_TRANSACTION_TYPES, DEFAULT_VALUES, FORM_ID, VENDOR_TRANSACTION_TYPES } from '@/constance/transactionContances'
import { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import { transactionFormSchema } from '@/schema/transactionFormSchema'
import { useVendorList } from '@/hooks/useVendor'
import { useCustomerList } from '@/hooks/useCustomer'

type TransactionFormValues = z.infer<typeof transactionFormSchema>

// helper functions
const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
  Object.values(BusinessEntityType).map((entity) => ({
    value: entity,
    label: entity,
  }))

const createEntityOptions = (
  selectedBusinessEntity: BusinessEntityType | null,
  vendorList: Vendor[],
  customerList: Customer[]
): ComboboxOptionInterface[] => {
  if (!selectedBusinessEntity) return []

  if (selectedBusinessEntity === BusinessEntityType.VENDOR) {
    return vendorList.map((vendor) => ({
      value: vendor.id,
      label: vendor.name
    }))
  }

  if (selectedBusinessEntity === BusinessEntityType.CUSTOMER) {
    return customerList.map((customer) => ({
      value: customer.id,
      label: customer.name
    }))
  }

  return []
}

const getEntityLabel = (entityType: BusinessEntityType | null): string => {
  if (entityType === BusinessEntityType.VENDOR) return 'Select Vendor'
  if (entityType === BusinessEntityType.CUSTOMER) return 'Select Customer'
  return 'Select Entity'
}

const getEntityPlaceholder = (entityType: BusinessEntityType | null): string => {
  if (entityType === BusinessEntityType.VENDOR) return 'Select vendor...'
  if (entityType === BusinessEntityType.CUSTOMER) return 'Select customer...'
  return 'Select entity...'
}

const getTransactionTypeOptions = (entityType: BusinessEntityType | null): ComboboxOptionInterface[] => {
  if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
  if (entityType === BusinessEntityType.CUSTOMER) return CUSTOMER_TRANSACTION_TYPES
  return []
}

// hook
const useTransactionForm = (currentRow?: TransactionRowInterface) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transaction: '',
      entityTypeId: '',
      transactionType: '',
      transactionPaymentStatus: undefined,
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        transaction: currentRow.title || '',
        entityTypeId: currentRow.id || '',
        transactionType: currentRow.transactionType || '',
        transactionPaymentStatus: currentRow.transactionPaymentStatus,
      })
    }
  }, [currentRow, form])

  return form
}

const useEntityData = (shopId: string | null) => {
  const { data: vendorList } = useVendorList(shopId || '')
  const { data: customerList } = useCustomerList(shopId || '')

  const flatVendorList = (vendorList || []).flat() as Vendor[]
  const flatCustomerList = (customerList || []).flat() as Customer[]

  return { flatVendorList, flatCustomerList }
}

// main component
const TransactionMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TransactionMutateDrawerProps) => {

  const [selectedBusinessEntity, setSelectedBusinessEntity] = useState<BusinessEntityType | null>(null)

  // hooks
  const shopId = getCurrentShopId()
  const form = useTransactionForm(currentRow)
  const { flatVendorList, flatCustomerList } = useEntityData(shopId)

  // watch transactionType to conditionally render Payment Status
  const transactionType = form.watch("transactionType")

  // computed values
  const isUpdate = !!currentRow
  const businessEntityOptions = createBusinessEntityOptions()
  const entityOptions = createEntityOptions(selectedBusinessEntity, flatVendorList, flatCustomerList)
  const transactionTypeOptions = getTransactionTypeOptions(selectedBusinessEntity)
  const entityLabel = getEntityLabel(selectedBusinessEntity)
  const entityPlaceholder = getEntityPlaceholder(selectedBusinessEntity)

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      form.reset(DEFAULT_VALUES)
      setSelectedBusinessEntity(null)
    }
  }

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    // reset
    form.setValue('entityTypeId', '')
    form.setValue('transactionType', '')
    form.setValue('transactionPaymentStatus', undefined)
  }

  const handleFormSubmit = (values: TransactionFormValues) => {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', values)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>
            {isUpdate ? 'Update' : 'Create'} Transaction
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the transaction by providing necessary info.'
              : 'Add a new transaction by providing necessary info.'}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id={FORM_ID}
            className="flex-1 space-y-6 overflow-y-auto px-4"
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            {/* business entity fields */}
            <FormField
              control={form.control}
              name="transaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction</FormLabel>
                  <FormControl>
                    <Combobox
                      options={businessEntityOptions}
                      placeholder="Select transaction..."
                      onSelect={(value) => {
                        field.onChange(value)
                        handleBusinessEntitySelect(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* conditional entity field */}
            {selectedBusinessEntity && entityOptions.length > 0 && (
              <FormField
                control={form.control}
                name="entityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{entityLabel}</FormLabel>
                    <FormControl>
                      <Combobox
                        options={entityOptions}
                        placeholder={entityPlaceholder}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* conditional transaction type field with empty check */}
            {selectedBusinessEntity && (
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => {
                  const isEmpty =
                    (selectedBusinessEntity === BusinessEntityType.VENDOR && flatVendorList.length === 0) ||
                    (selectedBusinessEntity === BusinessEntityType.CUSTOMER && flatCustomerList.length === 0)

                  return (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <Combobox
                          options={transactionTypeOptions}
                          placeholder={
                            isEmpty
                              ? selectedBusinessEntity === BusinessEntityType.VENDOR
                                ? 'No vendor available'
                                : 'No customer available'
                              : 'Select transaction type...'
                          }
                          onSelect={field.onChange}
                          disabled={isEmpty}
                        />
                      </FormControl>
                      {isEmpty && (
                        <p className="text-sm text-red-500 ml-1">
                          {selectedBusinessEntity === BusinessEntityType.VENDOR
                            ? 'Please add a vendor first.'
                            : 'Please add a customer first.'}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            )}

            {/* paid or received field */}
            {transactionType === "payment" && (
              <FormField
                control={form.control}
                name="transactionPaymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value === "paid"}
                            onCheckedChange={() => field.onChange("paid")}
                          />
                          <span>Paid</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value === "received"}
                            onCheckedChange={() => field.onChange("received")}
                          />
                          <span>Received</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form={FORM_ID} type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TransactionMutateDrawer