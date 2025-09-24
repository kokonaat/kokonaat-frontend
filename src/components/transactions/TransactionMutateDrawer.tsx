import { useState, useEffect, useMemo } from "react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Combobox } from "../ui/combobox"
import { Input } from "../ui/input"
import type {
  ComboboxOptionInterface,
  TransactionMutateDrawerProps,
  TransactionRowInterface,
} from "@/interface/transactionInterface"
import type { Customer } from "@/interface/customerInterface"
import type { Vendor } from "@/interface/vendorInterface"
import {
  CUSTOMER_TRANSACTION_TYPES,
  DEFAULT_VALUES,
  FORM_ID,
  VENDOR_TRANSACTION_TYPES,
} from "@/constance/transactionContances"
import { BusinessEntityType } from "@/utils/enums/trasaction.enum"
import { transactionFormSchema } from "@/schema/transactionFormSchema"
import { useVendorList } from "@/hooks/useVendor"
import { useCustomerList } from "@/hooks/useCustomer"
import { useCreateTransaction } from "@/hooks/useTransaction"
import { useShopStore } from "@/stores/shopStore"

type TransactionFormValues = z.infer<typeof transactionFormSchema>

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Helper: create options
const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
  Object.values(BusinessEntityType).map((entity) => ({
    value: entity,
    label: entity,
  }))

const createEntityOptions = (
  entities: (Vendor | Customer)[]
): ComboboxOptionInterface[] => {
  return entities.map((entity) => ({
    value: entity.id,
    label: entity.name,
  }))
}

const getEntityLabel = (entityType: BusinessEntityType | null): string => {
  if (entityType === BusinessEntityType.VENDOR) return "Select Vendor"
  if (entityType === BusinessEntityType.CUSTOMER) return "Select Customer"
  return "Select Entity"
}

const getEntityPlaceholder = (entityType: BusinessEntityType | null): string => {
  if (entityType === BusinessEntityType.VENDOR) return "Select vendor..."
  if (entityType === BusinessEntityType.CUSTOMER) return "Select customer..."
  return "Select entity..."
}

const getTransactionTypeOptions = (
  entityType: BusinessEntityType | null
): ComboboxOptionInterface[] => {
  if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
  if (entityType === BusinessEntityType.CUSTOMER) return CUSTOMER_TRANSACTION_TYPES
  return []
}

// Custom hook: form
const useTransactionForm = (currentRow?: TransactionRowInterface) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        partnerType: currentRow.title || "",
        entityTypeId: currentRow.id || "",
        transactionType: currentRow.transactionType || "",
        transactionAmount: currentRow.transactionAmount,
      })
    }
  }, [currentRow, form])

  return form
}

// Custom hook: fetch entities with search
const useEntityData = (
  shopId: string | null,
  selectedBusinessEntity: BusinessEntityType | null,
  searchQuery: string
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Only fetch vendors when VENDOR is selected
  const { data: vendorResponse, isFetching: isVendorFetching } = useVendorList(
    shopId || "",
    1,
    50, // Increased limit for better search results
    debouncedSearchQuery || undefined,
    {
      enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.VENDOR,
    }
  )

  // Only fetch customers when CUSTOMER is selected
  const { data: customerResponse, isFetching: isCustomerFetching } = useCustomerList(
    shopId || "",
    1,
    50, // Increased limit for better search results
    debouncedSearchQuery || undefined,
    {
      enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.CUSTOMER,
    }
  )

  const flatVendorList = (vendorResponse?.data || []) as Vendor[]
  const flatCustomerList = (customerResponse?.customers || []) as Customer[]

  const isLoading =
    (selectedBusinessEntity === BusinessEntityType.VENDOR && isVendorFetching) ||
    (selectedBusinessEntity === BusinessEntityType.CUSTOMER && isCustomerFetching)

  return {
    flatVendorList,
    flatCustomerList,
    isLoading
  }
}

// Main component
const TransactionMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TransactionMutateDrawerProps) => {
  const [selectedBusinessEntity, setSelectedBusinessEntity] =
    useState<BusinessEntityType | null>(null)
  const [entitySearchQuery, setEntitySearchQuery] = useState("")

  const shopId = useShopStore((s) => s.currentShopId)
  const form = useTransactionForm(currentRow)
  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )
  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId!)

  const transactionType = form.watch("transactionType")
  const isUpdate = !!currentRow

  const businessEntityOptions = createBusinessEntityOptions()

  // Memoized entity options based on selected business entity
  const entityOptions = useMemo(() => {
    if (!selectedBusinessEntity) return []

    if (selectedBusinessEntity === BusinessEntityType.VENDOR) {
      return createEntityOptions(flatVendorList)
    }

    if (selectedBusinessEntity === BusinessEntityType.CUSTOMER) {
      return createEntityOptions(flatCustomerList)
    }

    return []
  }, [selectedBusinessEntity, flatVendorList, flatCustomerList])

  const transactionTypeOptions = getTransactionTypeOptions(selectedBusinessEntity)
  const entityLabel = getEntityLabel(selectedBusinessEntity)
  const entityPlaceholder = getEntityPlaceholder(selectedBusinessEntity)

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      form.reset(DEFAULT_VALUES)
      setSelectedBusinessEntity(null)
      setEntitySearchQuery("")
    }
  }

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    setEntitySearchQuery("") // Reset search when changing business entity
    form.setValue("entityTypeId", "")
    form.setValue("transactionType", "")
    form.setValue("transactionAmount", undefined)
  }

  const handleEntitySearch = (query: string) => {
    setEntitySearchQuery(query)
  }

  const handleFormSubmit = (values: TransactionFormValues) => {
    if (!shopId || !selectedBusinessEntity) return

    const entityId = values.entityTypeId
    const amount = values.transactionAmount
    const selectedTransactionType = values.transactionType

    if (!entityId || !selectedTransactionType || amount === undefined) {
      return
    }

    const payload =
      selectedBusinessEntity === BusinessEntityType.VENDOR
        ? {
          shopId,
          partnerType: "VENDOR" as const,
          vendorId: entityId,
          transactionType: selectedTransactionType,
          amount,
        }
        : {
          shopId,
          partnerType: "CUSTOMER" as const,
          customerId: entityId,
          transactionType: selectedTransactionType,
          amount,
        }

    createTransaction(payload, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset(DEFAULT_VALUES)
        toast.success("Transaction created successfully.")
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Transaction</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the transaction by providing necessary info."
              : "Add a new transaction by providing necessary info."}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id={FORM_ID}
            className="flex-1 space-y-6 overflow-y-auto px-4"
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            {/* Partner Type */}
            <FormField
              control={form.control}
              name="partnerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Type</FormLabel>
                  <FormControl>
                    <Combobox
                      options={businessEntityOptions}
                      placeholder="Select transaction..."
                      className="w-full"
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

            {/* Entity selection with search */}
            {selectedBusinessEntity && (
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
                        className="w-full"
                        emptyMessage={
                          entityOptions.length === 0 && !isLoading
                            ? selectedBusinessEntity === BusinessEntityType.VENDOR
                              ? "No vendors found"
                              : "No customers found"
                            : "No results found"
                        }
                        value={field.value}
                        onSelect={field.onChange}
                        onSearch={handleEntitySearch}
                        loading={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Transaction Type */}
            {selectedBusinessEntity && (
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => {
                  const isEmpty = entityOptions.length === 0 && !isLoading

                  return (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <Combobox
                          options={transactionTypeOptions}
                          className="w-full"
                          placeholder={
                            isEmpty
                              ? selectedBusinessEntity === BusinessEntityType.VENDOR
                                ? "No vendor available"
                                : "No customer available"
                              : "Select transaction type..."
                          }
                          onSelect={field.onChange}
                          disabled={isEmpty}
                        />
                      </FormControl>
                      {isEmpty && (
                        <p className="text-sm text-red-500 ml-1">
                          {selectedBusinessEntity === BusinessEntityType.VENDOR
                            ? "Please add a vendor first."
                            : "Please add a customer first."}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            )}

            {/* Amount */}
            {selectedBusinessEntity && transactionType && (
              <FormField
                control={form.control}
                name="transactionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="w-full"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
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
          <Button form={FORM_ID} type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TransactionMutateDrawer