import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { useInventoryList } from "@/hooks/useInventory"
import { useShopStore } from "@/stores/shopStore"
import { Minus, Plus } from "lucide-react"

// debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// helpers
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

// fetch entities
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

// main component
const TransactionMutateDrawer = ({ open, onOpenChange, currentRow }: TransactionMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [selectedBusinessEntity, setSelectedBusinessEntity] = useState<BusinessEntityType | null>(null)
  const [entitySearchQuery, setEntitySearchQuery] = useState("")
  const [inventorySearchQuery, setInventorySearchQuery] = useState("")

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // field array for inventory items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventoryItems",
  })

  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )

  const { data: inventoryResponse = { items: [] }, isFetching: isInventoryLoading } = useInventoryList(
    shopId || "",
    1,
    10,
    inventorySearchQuery,
    { enabled: !!shopId && (form.watch("transactionType") === "PURCHASE" || form.watch("transactionType") === "SELL_OUT") }
  )

  const inventoryOptions = useMemo(() => {
    return inventoryResponse.items.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [inventoryResponse.items])

  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId!)

  const transactionType = form.watch("transactionType")
  const showInventoryFields = transactionType === "PURCHASE" || transactionType === "SELL_OUT"

  // automatically add one inventory row when Purchase/Sell Out selected
  useEffect(() => {
    if (showInventoryFields && fields.length === 0) {
      append({ inventoryId: "", quantity: undefined, price: undefined })
    }
  }, [showInventoryFields, append, fields.length])

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
      setInventorySearchQuery("")
    }
  }

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    form.setValue("entityTypeId", "")
    form.setValue("transactionType", "")
    form.setValue("transactionAmount", undefined)
    form.setValue("inventoryItems", [])
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
          inventoryItems: showInventoryFields ? values.inventoryItems : undefined,
        }
        : {
          shopId,
          partnerType: "CUSTOMER" as const,
          customerId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          amount: showInventoryFields ? undefined : values.transactionAmount,
          inventoryItems: showInventoryFields ? values.inventoryItems : undefined,
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

  // calculate grand total
  const inventoryItems = form.watch("inventoryItems") || []
  const total = inventoryItems.reduce((acc: number, item: { quantity: number; price: number }) => {
    const quantity = item.quantity ?? 0
    const price = item.price ?? 0
    return acc + quantity * price
  }, 0)

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
          <form
            id={FORM_ID}
            className="flex-1 space-y-6 overflow-y-auto px-4"
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            <div className="flex items-end gap-4">
              {/* partner type */}
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

              {/* entity */}
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
            </div>

            {/* transaction type */}
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

            {/* inventory fields */}
            {selectedBusinessEntity && transactionType && (
              showInventoryFields ? (
                <>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4">
                      {/* inventory */}
                      <FormField
                        control={form.control}
                        name={`inventoryItems.${index}.inventoryId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Inventory</FormLabel>
                            <FormControl>
                              <Combobox
                                options={inventoryOptions}
                                placeholder="Select inventory..."
                                value={field.value}
                                // user selects existing item → id
                                onSelect={(val) => field.onChange(val)}
                                onSearch={(query) => {
                                  // inventory list api
                                  setInventorySearchQuery(query)
                                  // store typed name
                                  field.onChange(query)
                                }}
                                loading={isInventoryLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* quantity */}
                      <FormField
                        control={form.control}
                        name={`inventoryItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                placeholder="0"
                                min={0}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* price */}
                      <FormField
                        control={form.control}
                        name={`inventoryItems.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                placeholder="0.00"
                                min={0}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* plus minus buttons */}
                      <div className="flex gap-1 mb-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => append({ inventoryId: "", quantity: undefined, price: undefined })}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {index > 0 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* total field */}
                  {fields.length > 0 && (
                    <div className="flex items-center gap-4 mt-2">
                      <FormItem className="flex-1">
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={total}
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}
                </>
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
                          min={0}
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