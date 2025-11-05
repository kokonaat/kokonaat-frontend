import { useEffect, useMemo } from 'react'
import axios from 'axios'
import { useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
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
import { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import { useInventoryList } from '@/hooks/useInventory'
import { useCreateTransaction } from '@/hooks/useTransaction'
import { FORM_ID } from '@/constance/transactionContances'
import type {
  TransactionMutateDrawerProps,
  CreateTransactionDto,
} from '@/interface/transactionInterface'
import { useTransactionForm } from './hooks/useTransactionForm'
import { useEntityData } from './hooks/useEntityData'
import { calculatePending, calculateTotal, createEntityOptions } from './utils/transactionHelpers'
import { PartnerSelectionFields } from './PartnetSelectionFields'
import { TransactionTypeFields } from './TransactionTypeFields'
import { InventoryFields } from './InventoryFields'
import { AmountField } from './AmountField'
import { PaymentFields } from './PaymentFields'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { useDebounce } from '@/hooks/useDebounce'

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
  const showInventoryFields =
    transactionType === 'PURCHASE' || transactionType === 'SALE'

  // Debounce inventory search query
  const debouncedInventorySearch = useDebounce(inventorySearchQuery, 300)

  const {
    data: inventoryResponse = { items: [] },
    isFetching: isInventoryLoading,
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

  const handleBusinessEntitySelect = (value: string) => {
    setSelectedBusinessEntity(value as BusinessEntityType)
    form.setValue('entityTypeId', '')
    form.setValue('transactionType', '')
    form.setValue('transactionAmount', null)
    form.setValue('inventories', [])
    setInventoryInputValues({})
    setInventoryDisplayData({})
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
      | 'COMMISSION'
      | 'SELL_OUT'

    const inventoryDetailsPayload = showInventoryFields
      ? values.inventories?.map((
        item: TransactionFormValues['inventories'][number], index: number
      ) => {
        const inputValue = inventoryInputValues[index] || item.inventoryId

        // Check if it's an existing inventory by:
        // 1. Checking current inventoryOptions (search results)
        // 2. Checking selectedInventoryOptionsCache (previously selected inventories)
        // 3. Checking if it looks like a UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
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
          partnerType: 'CUSTOMER' as const,
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

    createTransaction(payload as CreateTransactionDto, {
      onSuccess: () => {
        toast.success('Transaction created successfully')
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
            <PartnerSelectionFields
              form={form}
              selectedBusinessEntity={selectedBusinessEntity}
              entityOptions={entityOptions}
              isLoading={isLoading}
              onBusinessEntitySelect={handleBusinessEntitySelect}
              onEntitySearch={setEntitySearchQuery}
            />

            <TransactionTypeFields
              form={form}
              selectedBusinessEntity={selectedBusinessEntity}
              transactionType={transactionType}
            />

            {selectedBusinessEntity &&
              transactionType &&
              (showInventoryFields ? (
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
              ) : (
                <AmountField form={form} />
              ))}

            <PaymentFields
              form={form}
              selectedBusinessEntity={selectedBusinessEntity}
              transactionType={transactionType}
              calculatedPending={calculatedPending}
            />
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