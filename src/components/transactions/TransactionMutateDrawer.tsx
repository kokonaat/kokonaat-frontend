import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import type { Resolver } from 'react-hook-form'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
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
import { Input } from '../ui/input'

import { useDebounce } from '../../hooks/useDebounce'
import { useShopStore } from '@/stores/shopStore'
import { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import { useCustomerList } from '@/hooks/useCustomer'
import { useInventoryList } from '@/hooks/useInventory'
import { useCreateTransaction } from '@/hooks/useTransaction'
import { useVendorList } from '@/hooks/useVendor'
import {
  CUSTOMER_TRANSACTION_TYPES,
  DEFAULT_VALUES,
  FORM_ID,
  PAYMENT_TYPES,
  VENDOR_TRANSACTION_TYPES,
} from '@/constance/transactionContances'
import type { Customer } from '@/interface/customerInterface'
import type {
  ComboboxOptionInterface,
  TransactionMutateDrawerProps,
  CreateTransactionDto,
} from '@/interface/transactionInterface'
import type { Vendor } from '@/interface/vendorInterface'
import { transactionFormSchema } from '@/schema/transactionFormSchema'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { InventoryItem } from '@/interface/inventoryInterface'

// helpers (omitted for brevity, assume unchanged)
const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
  Object.values(BusinessEntityType).map((entity) => ({
    value: entity,
    label: entity,
  }))

const createEntityOptions = (
  entities: (Vendor | Customer)[]
): ComboboxOptionInterface[] =>
  entities.map((entity) => ({ value: entity.id, label: entity.name }))

const getEntityLabel = (entityType: BusinessEntityType | null): string => {
  if (entityType === BusinessEntityType.VENDOR) return 'Select Vendor'
  if (entityType === BusinessEntityType.CUSTOMER) return 'Select Customer'
  return 'Select Entity'
}

const getEntityPlaceholder = (
  entityType: BusinessEntityType | null
): string => {
  if (entityType === BusinessEntityType.VENDOR) return 'Select vendor...'
  if (entityType === BusinessEntityType.CUSTOMER) return 'Select customer...'
  return 'Select entity...'
}

const getTransactionTypeOptions = (
  entityType: BusinessEntityType | null
): ComboboxOptionInterface[] => {
  if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
  if (entityType === BusinessEntityType.CUSTOMER)
    return CUSTOMER_TRANSACTION_TYPES
  return []
}

// fetch entities (omitted for brevity, assume unchanged)
const useEntityData = (
  shopId: string | null,
  selectedBusinessEntity: BusinessEntityType | null,
  searchQuery: string
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: vendorResponse, isFetching: isVendorFetching } = useVendorList(
    shopId || '',
    1,
    10,
    debouncedSearchQuery || undefined,
    {
      enabled: !!shopId && selectedBusinessEntity === BusinessEntityType.VENDOR,
    }
  )

  const { data: customerResponse, isFetching: isCustomerFetching } =
    useCustomerList(shopId || '', 1, 10, debouncedSearchQuery || undefined, {
      enabled:
        !!shopId && selectedBusinessEntity === BusinessEntityType.CUSTOMER,
    })

  return {
    flatVendorList: vendorResponse?.data || [],
    flatCustomerList: customerResponse?.customers || [],
    isLoading:
      (selectedBusinessEntity === BusinessEntityType.VENDOR &&
        isVendorFetching) ||
      (selectedBusinessEntity === BusinessEntityType.CUSTOMER &&
        isCustomerFetching),
  }
}

// main component
const TransactionMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TransactionMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [selectedBusinessEntity, setSelectedBusinessEntity] =
    useState<BusinessEntityType | null>(null)
  const [entitySearchQuery, setEntitySearchQuery] = useState('')
  const [inventorySearchQuery, setInventorySearchQuery] = useState('')

  // track which inventory items are new (by name) vs existing (by ID)
  const [inventoryInputValues, setInventoryInputValues] = useState<
    Record<number, string>
  >({})

  // 1. renaming key for clarity to match API: 'stockQuantity'
  // Note: We use this name internally, but it maps to 'quantity' in the API.
  const [inventoryDisplayData, setInventoryDisplayData] = useState<
    Record<number, { lastPrice: number | null, stockQuantity: number | null }>
  >({})


  // create a correctly typed resolver
  const resolver = zodResolver(
    transactionFormSchema
  ) as Resolver<TransactionFormValues>

  // then create the form
  const form = useForm<TransactionFormValues>({
    resolver,
    // ensure DEFAULT_VALUES shape matches
    defaultValues: DEFAULT_VALUES as TransactionFormValues,
  })

  // field array for inventory items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'inventories',
  })

  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )

  const {
    data: inventoryResponse = { items: [] as InventoryItem[] },
    isFetching: isInventoryLoading,
  } = useInventoryList(shopId || '', 1, 10, inventorySearchQuery, {
    enabled:
      !!shopId &&
      (form.watch('transactionType') === 'PURCHASE' ||
        form.watch('transactionType') === 'SALE'),
  })

  // stabilize inventoryList reference
  const inventoryList = useMemo(
    () => inventoryResponse.items || [],
    [inventoryResponse.items]
  )

  const inventoryOptions = useMemo(() => {
    // maps the full list
    return inventoryList.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [inventoryList])

  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId!)

  const transactionType = form.watch('transactionType')
  const showInventoryFields =
    transactionType === 'PURCHASE' || transactionType === 'SALE'

  // automatically add one inventory row when Purchase/Sell Out selected
  useEffect(() => {
    if (showInventoryFields && fields.length === 0) {
      append({ inventoryId: '', quantity: 0, price: 0 })
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
      setEntitySearchQuery('')
      setInventorySearchQuery('')
      setInventoryInputValues({})
      // Reset the display data state
      setInventoryDisplayData({})
    } else {
      // When opening, reset search query to ensure fresh data
      setInventorySearchQuery('')
    }
  }

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    form.setValue('entityTypeId', '')
    form.setValue('transactionType', '')
    // set to null
    form.setValue('transactionAmount', null)
    // reset 'inventories'
    form.setValue('inventories', [])
    setInventoryInputValues({})
    // Reset display data on entity change
    setInventoryDisplayData({})
  }

  const handleEntitySearch = (query: string) => setEntitySearchQuery(query)

  // calculate grand total (omitted for brevity, assume unchanged)
  const inventories = form.watch('inventories') || []

  const total = inventories.reduce(
    (
      acc: number,
      item: { quantity: number | undefined; price: number | undefined }
    ) => {
      const quantity = item.quantity ?? 0
      const price = item.price ?? 0
      return acc + quantity * price
    },
    0
  )

  // pending calculation (omitted for brevity, assume unchanged)
  const amount = showInventoryFields
    ? total
    : (form.watch('transactionAmount') ?? 0)
  const advancePaid = form.watch('advancePaid') ?? 0
  const paid = form.watch('paid') ?? 0
  const calculatedPending = amount + advancePaid - paid

  useEffect(() => {
    const pending = amount + advancePaid - paid
    form.setValue('pending', pending)
  }, [amount, advancePaid, paid, form])

  const handleFormSubmit = (values: TransactionFormValues) => {
    if (
      !shopId ||
      !selectedBusinessEntity ||
      !values.entityTypeId ||
      !values.transactionType
    )
      return

    const transactionTypeCasted = values.transactionType as
      | 'PURCHASE'
      | 'PAYMENT'
      | 'SALE'
      | 'COMMISSION'
      | 'SELL_OUT'

    const inventoryDetailsPayload = showInventoryFields
      ? values.inventories?.map((item, index) => {
        const inputValue = inventoryInputValues[index] || item.inventoryId

        // check if the value is an existing inventory ID (exists in options)
        const isExistingInventory = inventoryOptions.some(
          (opt) => opt.value === inputValue
        )

        if (isExistingInventory) {
          // existing inventory - send inventoryId
          return {
            inventoryId: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
          }
        } else {
          // new inventory - send inventoryName
          return {
            inventoryName: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
          }
        }
      })
      : undefined

    // Use the pending value from the form (which is correctly calculated as (amount + advancePaid) - paid)
    const pendingValue = Number(values.pending) || 0

    const isPaid = pendingValue === 0

    const payload =
      selectedBusinessEntity === BusinessEntityType.VENDOR
        ? {
          shopId,
          partnerType: 'VENDOR' as const,
          vendorId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          paymentType: values.paymentType,
          advancePaid: Number(values.advancePaid),
          paid: Number(values.paid),
          pending: pendingValue,
          amount: showInventoryFields ? undefined : values.transactionAmount,
          isPaid,
          details: inventoryDetailsPayload,
        }
        : {
          shopId,
          partnerType: "CUSTOMER" as const,
          customerId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          paymentType: values.paymentType,
          advancePaid: Number(values.advancePaid),
          paid: Number(values.paid),
          pending: pendingValue,
          amount: showInventoryFields ? undefined : values.transactionAmount,
          isPaid,
          details: inventoryDetailsPayload,
        }

    // cast the payload to the expected DTO shape
    createTransaction(payload as CreateTransactionDto, {
      onSuccess: () => {
        toast.success('Transaction created successfully')
        // reset all states before closing
        form.reset(DEFAULT_VALUES)
        setInventoryInputValues({})
        setInventorySearchQuery('')
        setEntitySearchQuery('')
        setSelectedBusinessEntity(null)
        // Reset display data on success
        setInventoryDisplayData({})
        onOpenChange(false)
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message)
        } else if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error('Something went wrong')
        }
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent variant='wide' className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {currentRow ? 'Update' : 'Create'} Transaction
          </SheetTitle>
          <SheetDescription>
            {currentRow
              ? 'Update the transaction by providing necessary info.'
              : 'Add a new transaction by providing necessary info.'}{' '}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id={FORM_ID}
            className='flex-1 space-y-6 overflow-y-auto px-4'
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            {/* partner, entity, transaction row (omitted for brevity) */}
            <div className='flex items-end gap-4'>
              {/* partner type */}
              <FormField
                control={form.control}
                name='partnerType'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Partner Type</FormLabel>
                    <FormControl>
                      <Combobox
                        options={createBusinessEntityOptions()}
                        placeholder='Select partner type...'
                        className='w-full'
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

              {/* entity()customer/vendor */}
              {selectedBusinessEntity && (
                <FormField
                  control={form.control}
                  name='entityTypeId'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>
                        {getEntityLabel(selectedBusinessEntity)}
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          options={entityOptions}
                          placeholder={getEntityPlaceholder(
                            selectedBusinessEntity
                          )}
                          className='w-full'
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

            <div className='flex items-end gap-4'>
              {/* transaction type */}
              {selectedBusinessEntity && (
                <FormField
                  control={form.control}
                  name='transactionType'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <Combobox
                          options={getTransactionTypeOptions(
                            selectedBusinessEntity
                          )}
                          className='w-full'
                          value={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* payment type */}
              {selectedBusinessEntity && transactionType && (
                <FormField
                  control={form.control}
                  name='paymentType'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Payment Type</FormLabel>
                      <FormControl>
                        <Combobox
                          options={PAYMENT_TYPES}
                          placeholder='Select payment type...'
                          className='w-full'
                          value={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* inventory fields */}
            {selectedBusinessEntity &&
              transactionType &&
              (showInventoryFields ? (
                <>
                  {fields.map((field, index) => {
                    const currentInputValue = inventoryInputValues[index] ?? ''
                    // Get the display data for the current row
                    const itemDisplayData = inventoryDisplayData[index]

                    // collect all selected values from OTHER rows (omitted for brevity)
                    const allOtherSelectedValues = Object.entries(
                      inventoryInputValues
                    )
                      .filter(([i]) => Number(i) !== index)
                      .map(([, v]) => v.toLowerCase().trim())
                      .filter((v) => v.length > 0)

                    // get all selected inventory names (by matching IDs to labels)
                    const allOtherSelectedNames = allOtherSelectedValues.map(
                      (val) => {
                        const option = inventoryOptions.find(
                          (opt) => opt.value === val
                        )
                        return option ? option.label.toLowerCase().trim() : val
                      }
                    )

                    // filter inventory options: exclude items already selected in other rows
                    const filteredInventoryOptions = inventoryOptions.filter(
                      (opt) => {
                        const optionName = opt.label.toLowerCase().trim()
                        return !allOtherSelectedNames.includes(optionName)
                      }
                    )

                    // helper to check if a value is already used in other rows
                    const isAlreadyUsed = (value: string): boolean => {
                      const normalized = value.toLowerCase().trim()
                      if (!normalized) return false

                      // check against all other rows' selected names
                      return allOtherSelectedNames.includes(normalized)
                    }

                    return (
                      <div key={field.id} className='flex items-end gap-4'>
                        <FormField
                          control={form.control}
                          name={`inventories.${index}.inventoryId`}
                          render={({ field }) => (
                            <FormItem className='w-36 sm:w-48 md:w-48'>
                              <FormLabel>Inventory</FormLabel>
                              <FormControl>
                                <Combobox
                                  options={filteredInventoryOptions}
                                  className='w-full'
                                  placeholder='Select inventory...'
                                  value={currentInputValue}
                                  onSelect={(val) => {
                                    // for selection from dropdown, check the label name
                                    const selectedOption = inventoryOptions.find(opt => opt.value === val)
                                    const nameToCheck = selectedOption ? selectedOption.label : val

                                    if (isAlreadyUsed(nameToCheck)) {
                                      toast.warning(
                                        'This inventory is already selected in another row'
                                      )
                                      // Reset display data if selection is blocked
                                      setInventoryDisplayData((prev) => ({
                                        ...prev,
                                        [index]: { lastPrice: null, stockQuantity: null },
                                      }))
                                      return
                                    }

                                    // Look up the selected inventory item from the full list
                                    const selectedInventory = inventoryList.find(
                                      (item) => item.id === val
                                    )

                                    // 2. reading the 'quantity' field from the API response object
                                    setInventoryDisplayData((prev) => ({
                                      ...prev,
                                      [index]: {
                                        lastPrice: selectedInventory?.lastPrice ?? null,
                                        stockQuantity: selectedInventory?.quantity ?? null,
                                      },
                                    }))

                                    field.onChange(val)
                                    setInventoryInputValues((prev) => ({
                                      ...prev,
                                      [index]: val,
                                    }))
                                  }}
                                  onSearch={(query) => {
                                    // only allow typing for PURCHASE transactions
                                    if (transactionType !== "PURCHASE") {
                                      return
                                    }

                                    if (isAlreadyUsed(query)) {
                                      toast.warning(
                                        'This inventory name is already used in another row'
                                      )
                                      // reset display data if selection is blocked
                                      setInventoryDisplayData((prev) => ({
                                        ...prev,
                                        [index]: { lastPrice: null, stockQuantity: null },
                                      }))
                                      return
                                    }

                                    // reset display data when typing a custom value
                                    setInventoryDisplayData((prev) => ({
                                      ...prev,
                                      [index]: { lastPrice: null, stockQuantity: null },
                                    }))

                                    field.onChange(query)
                                    setInventoryInputValues((prev) => ({
                                      ...prev,
                                      [index]: query,
                                    }))
                                  }}
                                  loading={isInventoryLoading}
                                  allowCustomValue={
                                    transactionType === 'PURCHASE' &&
                                    !isAlreadyUsed(currentInputValue)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-1 items-end gap-4">
                          {/* quantity */}
                          <FormField
                            control={form.control}
                            name={`inventories.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    {...field}
                                    placeholder='0'
                                    min={0}
                                    value={
                                      field.value === 0
                                        ? ''
                                        : (field.value ?? '')
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value
                                      field.onChange(
                                        val === '' ? '' : Number(val)
                                      )
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                                {/* display quantity */}
                                {itemDisplayData?.stockQuantity !== undefined &&
                                  itemDisplayData.stockQuantity !== null && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      **Stock:** {itemDisplayData.stockQuantity}
                                    </p>
                                  )}
                              </FormItem>
                            )}
                          />

                          {/* price */}
                          <FormField
                            control={form.control}
                            name={`inventories.${index}.price`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    {...field}
                                    placeholder='0.00'
                                    min={0}
                                    value={
                                      field.value === 0
                                        ? ''
                                        : (field.value ?? '')
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value
                                      field.onChange(
                                        val === '' ? '' : Number(val)
                                      )
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                                {/* display lastPrice */}
                                {itemDisplayData?.lastPrice !== undefined &&
                                  itemDisplayData.lastPrice !== null && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      **Last Price:** ${itemDisplayData.lastPrice.toFixed(2)}
                                    </p>
                                  )}
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* plus/minus buttons (omitted for brevity) */}
                        <div className='flex gap-1'>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() =>
                              append({ inventoryId: '', quantity: 0, price: 0 })
                            }
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                          {index > 0 && (
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              onClick={() => {
                                remove(index)
                                // remove display data for the removed row
                                setInventoryDisplayData((prev) => {
                                  const newState = { ...prev }
                                  delete newState[index]
                                  // re-key the remaining items (optional but good practice for field arrays)
                                  return Object.keys(newState).reduce(
                                    (acc, key, _i) => {
                                      const numKey = Number(key)
                                      if (numKey > index) {
                                        acc[numKey - 1] = newState[numKey]
                                      } else {
                                        acc[numKey] = newState[numKey]
                                      }
                                      return acc
                                    },
                                    {} as Record<number, { lastPrice: number | null, stockQuantity: number | null }>
                                  )
                                })
                              }}
                            >
                              <Minus className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* total field (omitted for brevity) */}
                  {fields.length > 0 && (
                    <div className='flex justify-end'>
                      <div className='w-60'></div>
                      <FormItem className='max-w-52'>
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={total}
                            readOnly
                            className='cursor-not-allowed bg-gray-100'
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}
                </>
              ) : (
                // fallback for non-inventory transactions (amount field) (omitted for brevity)
                <div className='flex justify-end'>
                  <FormField
                    control={form.control}
                    name='transactionAmount'
                    render={({ field }) => (
                      <FormItem className='max-w-52'>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            placeholder='0.00'
                            min={0}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

            {/* advance paid (omitted for brevity) */}
            <div className='flex justify-end'>
              {selectedBusinessEntity &&
                (transactionType === 'PURCHASE' ||
                  transactionType === 'SALE') && (
                  <FormField
                    control={form.control}
                    name='advancePaid'
                    render={({ field }) => (
                      <FormItem className='max-w-52'>
                        <FormLabel>Advance Paid</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            placeholder='0.00'
                            min={0}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              field.onChange(val === '' ? '' : Number(val))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>

            {/* paid (omitted for brevity) */}
            {selectedBusinessEntity &&
              (transactionType === 'PURCHASE' ||
                transactionType === 'SALE') && (
                <div className='flex justify-end'>
                  {selectedBusinessEntity && transactionType && (
                    <FormField
                      control={form.control}
                      name='paid'
                      render={({ field }) => (
                        <FormItem className='max-w-52'>
                          <FormLabel>Paid</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              placeholder='0.00'
                              min={0}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value
                                field.onChange(val === '' ? '' : Number(val))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

            {/* pending (omitted for brevity) */}
            {selectedBusinessEntity &&
              (transactionType === 'PURCHASE' ||
                transactionType === 'SALE') && (
                <div className='flex justify-end'>
                  {selectedBusinessEntity && transactionType && (
                    <FormField
                      control={form.control}
                      name='pending'
                      render={({ field }) => (
                        <FormItem className='max-w-52'>
                          <FormLabel>Pending</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              placeholder='0.00'
                              min={0}
                              value={field.value ?? calculatedPending}
                              onChange={(e) => {
                                const val = e.target.value
                                field.onChange(val === '' ? '' : Number(val))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form={FORM_ID} type='submit' disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TransactionMutateDrawer