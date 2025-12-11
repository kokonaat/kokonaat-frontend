import { useEffect, useMemo } from 'react'
import axios from 'axios'
import { useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useShopStore } from '@/stores/shopStore'
import { useInventoryList } from '@/hooks/useInventory'
import { useCreateTransaction } from '@/hooks/useTransaction'
import { BusinessEntityType, FORM_ID } from '@/constance/transactionConstances'
import type {
  TransactionMutateDrawerProps,
  CreateTransactionDto,
} from '@/interface/transactionInterface'
import { useTransactionForm } from './hooks/useTransactionForm'
import { useEntityData } from './hooks/useEntityData'
import {
  calculatePending,
  calculateTotal,
  createEntityOptions,
  getEntityTypeForTransaction,
  requiresInventoryFields,
  requiresAmountField
} from './utils/transactionHelpers'
import { TransactionTypeField } from './TransactionTypeFields'
import { PartnerSelectionFields } from './PartnetSelectionFields'
import { PaymentTypeField } from './PaymentTypeField'
import { InventoryFields } from './InventoryFields'
import { AmountField } from './AmountField'
import { PaymentFields } from './PaymentFields'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '../ui/input'

const TransactionMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TransactionMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)

  const {
    form,
    selectedBusinessEntity,
    setSelectedBusinessEntity,
    entitySearchQuery,
    setEntitySearchQuery,
    inventorySearchQuery,
    setInventorySearchQuery,
    inventoryInputValues,
    setInventoryInputValues,
    inventoryDisplayData,
    setInventoryDisplayData,
    selectedInventoryOptionsCache,
    setSelectedInventoryOptionsCache,
    resetFormStates,
  } = useTransactionForm()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'inventories',
  })

  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )

  const transactionType = form.watch('transactionType')
  const entityTypeId = form.watch('entityTypeId')
  const paymentType = form.watch('paymentType')

  const showInventoryFields = requiresInventoryFields(transactionType)
  const showAmountField = requiresAmountField(transactionType)
  const showPartnerTypeSelector = transactionType === 'COMMISSION'

  // Debounce inventory search query
  const debouncedInventorySearch = useDebounce(inventorySearchQuery, 300)

  const {
    data: inventoryResponse = { items: [] },
    isFetching: isInventoryLoading,
    // refetch: refetchInventories,
  } = useInventoryList(
    shopId || '',
    1,
    10,
    debouncedInventorySearch || undefined,
    undefined,
    undefined,
    {
      enabled: !!shopId && showInventoryFields,
    }
  )

  const inventoryList = useMemo(
    () => inventoryResponse.items || [],
    [inventoryResponse.items]
  )

  const inventoryOptions = useMemo(() => {
    return inventoryList.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [inventoryList])

  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId!)

  // Set business entity based on transaction type
  useEffect(() => {
    if (transactionType && transactionType !== 'COMMISSION') {
      const entityType = getEntityTypeForTransaction(transactionType)
      if (entityType) {
        setSelectedBusinessEntity(entityType)
        form.setValue('partnerType', entityType)
      }
    }
  }, [transactionType, setSelectedBusinessEntity, form])

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

  const inventories = form.watch('inventories') || []
  const total = calculateTotal(inventories)

  const amount = showInventoryFields ? total : (form.watch('transactionAmount') ?? 0)
  const advancePaid = form.watch('advancePaid') ?? 0
  const paid = form.watch('paid') ?? 0
  const calculatedPending = calculatePending(amount, advancePaid, paid)

  useEffect(() => {
    const pending = calculatePending(amount, advancePaid, paid)
    form.setValue('pending', pending)
  }, [amount, advancePaid, paid, form])

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      resetFormStates()
    } else {
      setInventorySearchQuery('')
    }
  }

  const handleTransactionTypeChange = (value: string) => {
    // Reset dependent fields
    form.setValue('partnerType', '')
    form.setValue('entityTypeId', '')
    form.setValue('paymentType', '')
    form.setValue('transactionAmount', null)
    form.setValue('inventories', [])
    setInventoryInputValues({})
    setInventoryDisplayData({})

    // For non-commission transactions, auto-set the partner type
    if (value !== 'COMMISSION') {
      const entityType = getEntityTypeForTransaction(value)
      if (entityType) {
        setSelectedBusinessEntity(entityType)
      }
    } else {
      setSelectedBusinessEntity(null)
    }
  }

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    form.setValue('entityTypeId', '')
  }

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
      | 'RECEIVABLE'
      | 'COMMISSION'

    const inventoryDetailsPayload = showInventoryFields
      ? values.inventories?.map((
        item: TransactionFormValues['inventories'][number], index: number
      ) => {
        const inputValue = inventoryInputValues[index] || item.inventoryId

        const isInOptions = inventoryOptions.some(
          (opt) => opt.value === inputValue
        )
        const isInCache = selectedInventoryOptionsCache[inputValue] !== undefined
        const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputValue)

        const isExistingInventory = isInOptions || isInCache || looksLikeUUID

        if (isExistingInventory) {
          return {
            inventoryId: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
          }
        } else {
          return {
            inventoryName: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
          }
        }
      })
      : undefined

    const pendingValue = Number(values.pending) || 0
    // const isPaid = pendingValue === 0

    const payload =
      selectedBusinessEntity === BusinessEntityType.VENDOR
        ? {
          shopId,
          // partnerType: 'VENDOR' as const,
          vendorId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          remarks: values.remarks,
          paymentType: values.paymentType,
          advancePaid: Number(values.advancePaid),
          paid: Number(values.paid),
          pending: pendingValue,
          totalAmount: showInventoryFields ? undefined : values.transactionAmount,
          // isPaid,
          details: inventoryDetailsPayload,
        }
        : {
          shopId,
          // partnerType: 'CUSTOMER' as const,
          customerId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          remarks: values.remarks,
          paymentType: values.paymentType,
          advancePaid: Number(values.advancePaid),
          paid: Number(values.paid),
          pending: pendingValue,
          totalAmount: showInventoryFields ? undefined : values.transactionAmount,
          // isPaid,
          details: inventoryDetailsPayload,
        }

    createTransaction(payload as CreateTransactionDto, {
      onSuccess: async () => {
        toast.success('Transaction created successfully')

        try {
          // await refetchInventories()
        } catch (_) { /* empty */ }

        resetFormStates()
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

  const showPaymentFields = showInventoryFields

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
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <TransactionTypeField
                  form={form}
                  onTransactionTypeChange={handleTransactionTypeChange}
                />
              </div>

              <div className="flex-1">
                <PartnerSelectionFields
                  form={form}
                  transactionType={transactionType}
                  selectedBusinessEntity={selectedBusinessEntity}
                  entityOptions={entityOptions}
                  isLoading={isLoading}
                  onBusinessEntitySelect={handleBusinessEntitySelect}
                  onEntitySearch={setEntitySearchQuery}
                  showPartnerTypeSelector={showPartnerTypeSelector}
                />
              </div>
            </div>

            <div className='flex items-end gap-4'>
              <div className="flex-1">
                {entityTypeId && <PaymentTypeField form={form} />}
              </div>

              <div className="flex-1">
                {entityTypeId && (
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Remarks"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {entityTypeId && paymentType && (
              showInventoryFields ? (
                <InventoryFields
                  form={form}
                  fields={fields}
                  append={append}
                  remove={remove}
                  inventoryOptions={inventoryOptions}
                  inventoryList={inventoryList}
                  inventoryInputValues={inventoryInputValues}
                  setInventoryInputValues={setInventoryInputValues}
                  inventoryDisplayData={inventoryDisplayData}
                  setInventoryDisplayData={setInventoryDisplayData}
                  selectedInventoryOptionsCache={selectedInventoryOptionsCache}
                  setSelectedInventoryOptionsCache={setSelectedInventoryOptionsCache}
                  isInventoryLoading={isInventoryLoading}
                  transactionType={transactionType}
                  onInventorySearch={setInventorySearchQuery}
                />
              ) : showAmountField ? (
                <AmountField form={form} />
              ) : null
            )}

            {showPaymentFields && entityTypeId && paymentType && (
              <PaymentFields
                total={total}
                form={form}
                selectedBusinessEntity={selectedBusinessEntity}
                transactionType={transactionType}
                calculatedPending={calculatedPending}
              />
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