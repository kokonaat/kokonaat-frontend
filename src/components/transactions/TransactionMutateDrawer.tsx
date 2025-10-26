import { useState, useEffect, useMemo } from "react"
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
import type { TransactionFormValues } from "@/schema/transactionFormSchema"
import { useVendorList } from "@/hooks/useVendor"
import { useCustomerList } from "@/hooks/useCustomer"
import { useCreateTransaction } from "@/hooks/useTransaction"
import { useShopStore } from "@/stores/shopStore"

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// Helpers
const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
  Object.values(BusinessEntityType).map((entity) => ({ value: entity, label: entity }))

const createEntityOptions = (entities: (Vendor | Customer)[]): ComboboxOptionInterface[] =>
  entities.map((entity) => ({ value: entity.id, label: entity.name }))

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

const getTransactionTypeOptions = (entityType: BusinessEntityType | null): ComboboxOptionInterface[] => {
  if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
  if (entityType === BusinessEntityType.CUSTOMER) return CUSTOMER_TRANSACTION_TYPES
  return []
}

// Fetch entities
const useEntityData = (
  shopId: string | null,
  selectedBusinessEntity: BusinessEntityType | null,
  searchQuery: string
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: vendorResponse, isFetching: isVendorFetching } = useVendorList(
    shopId || "",
    1,
    10,
    debouncedSearchQuery || undefined,
    { enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.VENDOR }
  )

  const { data: customerResponse, isFetching: isCustomerFetching } = useCustomerList(
    shopId || "",
    1,
    10,
    debouncedSearchQuery || undefined,
    { enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.CUSTOMER }
  )

  return {
    flatVendorList: vendorResponse?.data || [],
    flatCustomerList: customerResponse?.customers || [],
    isLoading:
      (selectedBusinessEntity === BusinessEntityType.VENDOR && isVendorFetching) ||
      (selectedBusinessEntity === BusinessEntityType.CUSTOMER && isCustomerFetching),
  }
}

// Main component
const TransactionMutateDrawer = ({ open, onOpenChange, currentRow }: TransactionMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [selectedBusinessEntity, setSelectedBusinessEntity] = useState<BusinessEntityType | null>(null)
  const [entitySearchQuery, setEntitySearchQuery] = useState("")

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )

  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId!)

  const transactionType = form.watch("transactionType")
  const showInventoryFields = transactionType === "PURCHASE" || transactionType === "SELL_OUT"

  const entityOptions = useMemo(() => {
    if (!selectedBusinessEntity) return []
    return selectedBusinessEntity === BusinessEntityType.VENDOR
      ? createEntityOptions(flatVendorList)
      : createEntityOptions(flatCustomerList)
  }, [selectedBusinessEntity, flatVendorList, flatCustomerList])

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
    form.setValue("entityTypeId", "")
    form.setValue("transactionType", "")
    form.setValue("transactionAmount", undefined)
    form.setValue("inventoryId", "")
    form.setValue("quantity", undefined)
    form.setValue("price", undefined)
  }

  const handleEntitySearch = (query: string) => setEntitySearchQuery(query)

  const handleFormSubmit = (values: TransactionFormValues) => {
    if (!shopId || !selectedBusinessEntity || !values.entityTypeId || !values.transactionType) return

    const transactionTypeCasted = values.transactionType as "PURCHASE" | "PAYMENT" | "SALE" | "COMMISSION"

    const payload =
      selectedBusinessEntity === BusinessEntityType.VENDOR
        ? {
          shopId,
          partnerType: "VENDOR" as const,
          vendorId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          amount: showInventoryFields ? undefined : values.transactionAmount,
          inventoryId: showInventoryFields ? values.inventoryId : undefined,
          quantity: showInventoryFields ? values.quantity : undefined,
          price: showInventoryFields ? values.price : undefined,
        }
        : {
          shopId,
          partnerType: "CUSTOMER" as const,
          customerId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          amount: showInventoryFields ? undefined : values.transactionAmount,
          inventoryId: showInventoryFields ? values.inventoryId : undefined,
          quantity: showInventoryFields ? values.quantity : undefined,
          price: showInventoryFields ? values.price : undefined,
        }

    createTransaction(payload, {
      onSuccess: () => {
        toast.success("Transaction created successfully")
        onOpenChange(false)
        form.reset(DEFAULT_VALUES)
      },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{currentRow ? "Update" : "Create"} Transaction</SheetTitle>
          <SheetDescription>
            {currentRow
              ? "Update the transaction by providing necessary info."
              : "Add a new transaction by providing necessary info."} Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form id={FORM_ID} className="flex-1 space-y-6 overflow-y-auto px-4" onSubmit={form.handleSubmit(handleFormSubmit)}>
            {/* Partner Type */}
            <FormField
              control={form.control}
              name="partnerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Type</FormLabel>
                  <FormControl>
                    <Combobox
                      options={createBusinessEntityOptions()}
                      placeholder="Select partner type..."
                      className="w-full"
                      value={field.value}
                      onSelect={(val) => {
                        field.onChange(val)
                        handleBusinessEntitySelect(val)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entity */}
            {selectedBusinessEntity && (
              <FormField
                control={form.control}
                name="entityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getEntityLabel(selectedBusinessEntity)}</FormLabel>
                    <FormControl>
                      <Combobox
                        options={entityOptions}
                        placeholder={getEntityPlaceholder(selectedBusinessEntity)}
                        className="w-full"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <Combobox
                        options={getTransactionTypeOptions(selectedBusinessEntity)}
                        className="w-full"
                        value={field.value}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Conditional Fields */}
            {selectedBusinessEntity && transactionType && (
              showInventoryFields ? (
                <div className="flex gap-4">
                  {/* Inventory */}
                  <FormField
                    control={form.control}
                    name="inventoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Inventory</FormLabel>
                        <FormControl>
                          <Combobox
                            options={[
                              { value: "inv1", label: "Inventory 1" },
                              { value: "inv2", label: "Inventory 2" },
                              { value: "inv3", label: "Inventory 3" },
                            ]}
                            placeholder="Select inventory..."
                            value={field.value}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            placeholder="0.00"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="transactionAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
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