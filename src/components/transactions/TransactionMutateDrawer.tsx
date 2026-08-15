import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useFieldArray, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Combobox } from '@/components/ui/combobox'
import { useShopStore } from '@/stores/shopStore'
import { useInventoryList } from '@/hooks/useInventory'
import { useCreateTransaction, useUpdateTransaction, useTransactionList } from '@/hooks/useTransaction'
import { useCustomerAnalytics } from '@/hooks/useCustomer'
import { useVendorAnalytics } from '@/hooks/useVendor'
import { BusinessEntityType, FORM_ID } from '@/constance/transactionConstances'
import type {
  TransactionMutateDrawerProps,
  CreateTransactionDto,
} from '@/interface/transactionInterface'
import { useTransactionForm } from './hooks/useTransactionForm'
import { useEntityData } from './hooks/useEntityData'
import {
  calculateTotal,
  createEntityOptions,
  getEntityTypeForTransaction,
  requiresInventoryFields,
  requiresAmountField
} from './utils/transactionHelpers'
import { TransactionTypeField } from './TransactionTypeFields'
import { PartnerSelectionFields } from './PartnetSelectionFields'
import { InventoryFields } from './InventoryFields'
import { AmountField } from './AmountField'
import { PaymentFields } from './PaymentFields'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslation } from '@/hooks/useTranslation'
import { Input } from '../ui/input'
import { useUomList } from '@/hooks/useUom'
import { generateTransactionDetailsPDF } from '@/utils/enums/transactionDetailsPdf'
import { generateThermalPDF } from '@/utils/enums/thermalPdf'
import { getTransactionById } from '@/api/transactionApi'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { fmtAmount } from '@/lib/utils'

const TransactionMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TransactionMutateDrawerProps) => {
  const { t } = useTranslation('transactions')
  const { t: tToast } = useTranslation('toast')
  // flag uom
  const [uomSearchQueries, setUomSearchQueries] = useState<Record<number, string>>({})
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [pendingClose, setPendingClose] = useState(false)
  const [createdEntityCache, setCreatedEntityCache] = useState<{ id: string; name: string } | null>(null)
  const [selectedSourceTransactionId, setSelectedSourceTransactionId] = useState<string>('')

  const shopId = useShopStore((s) => s.currentShopId)
  const shopName = useShopStore((s) => s.currentShopName) ?? ''
  const submitModeRef = useRef<'save' | 'invoice' | 'thermal'>('save')
  const { t: tExport } = useI18nTranslation('export')

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

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: 'payments',
  })

  const { flatVendorList, flatCustomerList, isLoading } = useEntityData(
    shopId,
    selectedBusinessEntity,
    entitySearchQuery
  )

  const transactionType = form.watch('transactionType')
  const entityTypeId = form.watch('entityTypeId')
  const payments = useWatch({ control: form.control, name: 'payments' })

  const showInventoryFields = requiresInventoryFields(transactionType)
  const showAmountField = requiresAmountField(transactionType)
  const showPartnerTypeSelector = transactionType === 'COMMISSION'

  const isPaymentOrReceivable = transactionType === 'PAYMENT' || transactionType === 'RECEIVABLE'
  const sourceTransactionTypes = transactionType === 'PAYMENT' ? ['PURCHASE'] : ['SALE']
  const vendorIdsForSource = transactionType === 'PAYMENT' && entityTypeId ? [entityTypeId] : undefined
  const customerIdsForSource = transactionType === 'RECEIVABLE' && entityTypeId ? [entityTypeId] : undefined

  const { data: sourceTransactionsData } = useTransactionList(
    isPaymentOrReceivable && !!entityTypeId ? (shopId || '') : '',
    1,
    50,
    undefined,
    undefined,
    undefined,
    isPaymentOrReceivable ? sourceTransactionTypes : undefined,
    vendorIdsForSource,
    customerIdsForSource,
  )

  const sourceTransactionOptions = useMemo(() => {
    if (!isPaymentOrReceivable || !entityTypeId) return []
    const transactions = sourceTransactionsData?.data || []
    return transactions
      .filter(tx => (tx.pending ?? 0) > 0)
      .map(tx => ({
        value: tx.id,
        label: `${tx.no} — ${t('form.pendingAmount', { amount: fmtAmount(tx.pending, { min: 2, max: 2 }) })}`,
      }))
  }, [sourceTransactionsData, isPaymentOrReceivable, entityTypeId, t])

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

  // flag uom
  const { data: uomResponse = { items: [] }, isFetching: isUomLoading } = useUomList(
    shopId || '',
    1,
    10,
    undefined,
    { enabled: !!shopId && showInventoryFields }
  )

  const uomList = useMemo(() => uomResponse.items || [], [uomResponse.items])
  const uomOptions = useMemo(() => {
    return uomList.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [uomList])

  const inventoryOptions = useMemo(() => {
    return inventoryList.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [inventoryList])

  const { mutate: createTransaction, isPending: isCreatePending } = useCreateTransaction(shopId!)
  const { mutate: updateTransaction, isPending: isUpdatePending } = useUpdateTransaction(shopId!)
  const isPending = currentRow ? isUpdatePending : isCreatePending

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
    if (showInventoryFields && fields.length === 0 && !currentRow) {
      append({ inventoryId: '', quantity: 0, price: 0, unitOfMeasurementId: '' })
    }
  }, [showInventoryFields, append, fields.length, currentRow])

  // Populate form when editing an existing transaction
  useEffect(() => {
    if (!currentRow || !open) return

    const entityType = currentRow.vendor
      ? BusinessEntityType.VENDOR
      : BusinessEntityType.CUSTOMER
    setSelectedBusinessEntity(entityType)

    const entityId = currentRow.vendorId || currentRow.customerId || ''
    const isInventoryType =
      currentRow.transactionType === 'PURCHASE' || currentRow.transactionType === 'SALE'
    const isAmountOnlyType = currentRow.transactionType === 'COMMISSION'

    form.reset({
      transactionType: currentRow.transactionType,
      partnerType: entityType,
      entityTypeId: entityId,
      remarks: currentRow.remarks || '',
      payments: currentRow.payments && currentRow.payments.length > 0
        ? currentRow.payments.map((p) => ({ paymentType: p.paymentType, amount: Number(p.amount), remarks: p.remarks || '' }))
        : [{ paymentType: currentRow.paymentType || '', amount: Number(currentRow.paid), remarks: '' }],
      cnfCost: Number(currentRow.cnfCost) || 0,
      labourCost: Number(currentRow.labourCost) || 0,
      transportCost: Number(currentRow.transportCost) || 0,
      discount: Number(currentRow.discount) || 0,
      transactionAmount: isAmountOnlyType
        ? Number(currentRow.totalAmount || currentRow.paid)
        : null,
      inventories:
        isInventoryType && currentRow.details?.length
          ? currentRow.details.map((d) => ({
              inventoryId: d.inventory?.id || '',
              quantity: Number(d.quantity),
              price: Number(d.price),
              unitOfMeasurementId: d.unitOfMeasurement?.id || '',
            }))
          : [],
    })

    if (isInventoryType && currentRow.details?.length) {
      const newInputValues: Record<number, string> = {}
      currentRow.details.forEach((d, i) => {
        newInputValues[i] = d.inventory?.id || ''
      })
      setInventoryInputValues(newInputValues)
    }
  }, [currentRow, open]) // eslint-disable-line react-hooks/exhaustive-deps

  const entityOptions = useMemo(() => {
    if (!selectedBusinessEntity) return []
    const options = selectedBusinessEntity === BusinessEntityType.VENDOR
      ? createEntityOptions(flatVendorList)
      : createEntityOptions(flatCustomerList)
    if (createdEntityCache && !options.some(opt => opt.value === createdEntityCache.id)) {
      return [{ value: createdEntityCache.id, label: createdEntityCache.name }, ...options]
    }
    return options
  }, [selectedBusinessEntity, flatVendorList, flatCustomerList, createdEntityCache])

  const inventories = form.watch('inventories') || []
  const cnfCost = Number(form.watch('cnfCost')) || 0
  const labourCost = Number(form.watch('labourCost')) || 0
  const transportCost = Number(form.watch('transportCost')) || 0
  const discount = Number(form.watch('discount')) || 0
  const inventorySubtotal = calculateTotal(inventories)
  const total = inventorySubtotal + cnfCost + labourCost + transportCost - discount
  const transactionAmount = form.watch('transactionAmount')

  const remarks = form.watch('remarks')

  const totalPaid = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const { data: customerAnalytics } = useCustomerAnalytics(
    (transactionType === 'SALE' || transactionType === 'RECEIVABLE') && entityTypeId ? entityTypeId : ''
  )
  const { data: vendorAnalytics } = useVendorAnalytics(
    (transactionType === 'PURCHASE' || transactionType === 'PAYMENT') && entityTypeId ? entityTypeId : ''
  )

  // Pre-populate first payment amount with total + outstanding for new SALE/PURCHASE
  useEffect(() => {
    if (currentRow) return
    if (!showInventoryFields) return
    if (total <= 0) return
    const outstanding = transactionType === 'SALE'
      ? Number(customerAnalytics?.pending) || 0
      : transactionType === 'PURCHASE'
      ? Number(vendorAnalytics?.pending) || 0
      : 0
    form.setValue('payments.0.amount', total + outstanding, { shouldValidate: false })
  }, [total, transactionType, customerAnalytics?.pending, vendorAnalytics?.pending, showInventoryFields, currentRow, form])

  // Pre-populate first payment amount with entity's pending balance for PAYMENT/RECEIVABLE
  useEffect(() => {
    if (currentRow) return
    if (!isPaymentOrReceivable) return
    const pending = transactionType === 'PAYMENT'
      ? Number(vendorAnalytics?.pending) || 0
      : Number(customerAnalytics?.pending) || 0
    if (pending <= 0) return
    form.setValue('payments.0.amount', pending, { shouldValidate: false })
  }, [transactionType, vendorAnalytics?.pending, customerAnalytics?.pending, isPaymentOrReceivable, currentRow, form])

  // Check if form has any data entered
  const hasFormData = useMemo(() => {
    const hasTransactionType = !!transactionType
    const hasEntityId = !!entityTypeId
    const hasAmount = showAmountField ? (transactionAmount ?? 0) > 0 : isPaymentOrReceivable ? totalPaid > 0 : false
    const hasInventories = showInventoryFields ? (inventories?.length ?? 0) > 0 &&
      inventories?.some(inv => inv.inventoryId || inv.quantity > 0 || inv.price > 0) : false
    const hasPayments = totalPaid > 0 || (payments || []).some(p => p.paymentType)
    const hasRemarks = !!remarks

    return hasTransactionType || hasEntityId || hasAmount || hasInventories || hasPayments || hasRemarks
  }, [transactionType, entityTypeId, transactionAmount, inventories, totalPaid, payments, remarks, showAmountField, showInventoryFields])

  const handleOpenChange = (isOpen: boolean) => {
    // If opening, just open normally
    if (isOpen) {
      onOpenChange(isOpen)
      setInventorySearchQuery('')
      setPendingClose(false)
      return
    }

    // If closing and there's unsaved data, show confirmation
    if (!isOpen && hasFormData && !pendingClose) {
      setShowCloseConfirm(true)
      return
    }

    // Otherwise, close normally (either no data or confirmed close)
    onOpenChange(isOpen)
    if (!isOpen) {
      resetFormStates()
      setPendingClose(false)
    }
  }

  const handleConfirmClose = () => {
    setPendingClose(true)
    setShowCloseConfirm(false)
    onOpenChange(false)
    resetFormStates()
    setSelectedSourceTransactionId('')
  }

  const handleTransactionTypeChange = (value: string) => {
    // Reset dependent fields
    form.setValue('partnerType', '')
    form.setValue('entityTypeId', '')
    form.setValue('payments', [{ paymentType: '', amount: 0, remarks: '' }])
    form.setValue('transactionAmount', null)
    form.setValue('inventories', [])
    if (value === 'SALE') form.setValue('cnfCost', 0)
    setInventoryInputValues({})
    setInventoryDisplayData({})
    setCreatedEntityCache(null)
    setSelectedSourceTransactionId('')

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
    setCreatedEntityCache(null)
    setSelectedSourceTransactionId('')
  }

  const handleEntityCreated = (entity: { id: string; name: string }) => {
    setCreatedEntityCache(entity)
    form.setValue('entityTypeId', entity.id, { shouldValidate: true })
    setSelectedSourceTransactionId('')
  }

  const handleSourceTransactionSelect = (transactionId: string) => {
    setSelectedSourceTransactionId(transactionId)
    if (transactionId) {
      const sourceTx = (sourceTransactionsData?.data || []).find(tx => tx.id === transactionId)
      if (sourceTx && (sourceTx.pending ?? 0) > 0) {
        form.setValue('transactionAmount', Number(sourceTx.pending))
      }
    }
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

    // validation for Sale Quantity is < Stock
    if (values.transactionType === 'SALE') {
      const hasInsufficientStock = values.inventories.some((item, index) => {
        const stock = inventoryDisplayData[index]?.stockQuantity;
        return stock !== null && stock !== undefined && item.quantity > stock;
      });

      if (hasInsufficientStock) {
        toast.error(tToast('transaction.insufficientStock'))
        return
      }
    }

    // flag uom
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

        // Check if UOM is an existing ID (UUID) or a custom name
        const uomValue = item.unitOfMeasurementId
        const isExistingUom = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uomValue)

        if (isExistingInventory) {
          return {
            inventoryId: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
            ...(isExistingUom
              ? { unitOfMeasurementId: uomValue }
              : { unitOfMeasurementName: uomValue }
            ),
          }
        } else {
          return {
            inventoryName: inputValue,
            quantity: item.quantity as number,
            price: item.price as number,
            total: (item.quantity as number) * (item.price as number),
            ...(isExistingUom
              ? { unitOfMeasurementId: uomValue }
              : { unitOfMeasurementName: uomValue }
            ),
          }
        }
      })
      : undefined

    // For PAYMENT, RECEIVABLE, COMMISSION: paid = entered amount, totalAmount = 0
    // For PURCHASE, SALE: paid is sum of payment rows, totalAmount calculated from inventory
    const isAmountOnlyTransaction = transactionTypeCasted === 'COMMISSION'

    const paymentsTotal = (values.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    // Primary payment type = entry with the highest amount (or first entry)
    const primaryPaymentType = [...(values.payments || [])]
      .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0]?.paymentType || undefined

    const paidValue = isAmountOnlyTransaction
      ? Number(values.transactionAmount)
      : paymentsTotal

    // For PAYMENT/RECEIVABLE: set totalAmount to entity's current outstanding so that
    // pending = outstanding - paid gives the remaining balance visible in the transaction list.
    const entityOutstanding = transactionTypeCasted === 'PAYMENT'
      ? Number(vendorAnalytics?.pending) || 0
      : transactionTypeCasted === 'RECEIVABLE'
      ? Number(customerAnalytics?.pending) || 0
      : 0

    const totalAmountValue = (transactionTypeCasted === 'PAYMENT' || transactionTypeCasted === 'RECEIVABLE' || isAmountOnlyTransaction)
      ? entityOutstanding > 0 ? entityOutstanding : paidValue
      : undefined // Let backend calculate from inventory details

    const extraCosts = showInventoryFields
      ? {
          cnfCost: values.cnfCost || 0,
          labourCost: values.labourCost || 0,
          transportCost: values.transportCost || 0,
          discount: values.discount || 0,
        }
      : {}

    const validPayments = (values.payments || [])
      .filter((p) => p.paymentType && (Number(p.amount) || 0) > 0)
      .map((p) => ({ ...p, remarks: p.remarks?.trim() || undefined }))

    const payload =
      selectedBusinessEntity === BusinessEntityType.VENDOR
        ? {
          shopId,
          vendorId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          remarks: values.remarks,
          paymentType: primaryPaymentType,
          paid: paidValue,
          totalAmount: totalAmountValue,
          details: inventoryDetailsPayload,
          payments: validPayments,
          sourceTransactionId: selectedSourceTransactionId || undefined,
          ...extraCosts,
        }
        : {
          shopId,
          customerId: values.entityTypeId,
          transactionType: transactionTypeCasted,
          remarks: values.remarks,
          paymentType: primaryPaymentType,
          paid: paidValue,
          totalAmount: totalAmountValue,
          details: inventoryDetailsPayload,
          payments: validPayments,
          sourceTransactionId: selectedSourceTransactionId || undefined,
          ...extraCosts,
        }

    if (currentRow) {
      const updatePayload = {
        paid: paidValue,
        remarks: values.remarks,
        paymentType: primaryPaymentType,
        totalAmount: (transactionTypeCasted === 'PAYMENT' || transactionTypeCasted === 'RECEIVABLE' || isAmountOnlyTransaction) ? totalAmountValue : undefined,
        payments: validPayments,
      }
      updateTransaction(
        { id: currentRow.id, data: updatePayload },
        {
          onSuccess: async () => {
            toast.success(tToast('transaction.updated'))

            const mode = submitModeRef.current
            if ((mode === 'invoice' || mode === 'thermal') && currentRow?.id) {
              try {
                const full = await getTransactionById(shopId!, currentRow.id)
                const txn = full?.data ?? full
                if (mode === 'invoice') {
                  await generateTransactionDetailsPDF(tExport as any, txn, shopName)
                } else {
                  await generateThermalPDF(tExport as any, txn, shopName)
                }
              } catch (_) {
                toast.error('PDF generation failed')
              }
            }

            setPendingClose(true)
            resetFormStates()
            setSelectedSourceTransactionId('')
            onOpenChange(false)
          },
          onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
              toast.error(error.response?.data?.message || error.message)
            } else if (error instanceof Error) {
              toast.error(error.message)
            } else {
              toast.error(tToast('common.somethingWrong'))
            }
          },
        },
      )
      return
    }

    createTransaction(payload as CreateTransactionDto, {
      onSuccess: async (res) => {
        toast.success(tToast('transaction.created'))

        const mode = submitModeRef.current
        if ((mode === 'invoice' || mode === 'thermal') && res?.id) {
          try {
            const full = await getTransactionById(shopId!, res.id)
            const txn = full?.data ?? full
            if (mode === 'invoice') {
              await generateTransactionDetailsPDF(tExport as any, txn, shopName)
            } else {
              await generateThermalPDF(tExport as any, txn, shopName)
            }
          } catch (_) {
            toast.error('PDF generation failed')
          }
        }

        setPendingClose(true)
        resetFormStates()
        setSelectedSourceTransactionId('')
        onOpenChange(false)
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message)
        } else if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error(tToast('common.somethingWrong'))
        }
      },
    })
  }

  return (
    <>
      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title={t('createDrawer.discardTitle')}
        desc={t('createDrawer.discardDescription')}
        confirmText={t('createDrawer.discardConfirm')}
        cancelBtnText={t('createDrawer.discardCancel')}
        destructive
        handleConfirm={handleConfirmClose}
      />
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent variant='wide' className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {currentRow ? t('createDrawer.titleUpdate') : t('createDrawer.titleCreate')}
          </SheetTitle>
          <SheetDescription>
            {currentRow
              ? t('createDrawer.descriptionUpdate')
              : t('createDrawer.descriptionCreate')}
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
                  shopId={shopId || ''}
                  onEntityCreated={handleEntityCreated}
                />
              </div>
            </div>

            {isPaymentOrReceivable && entityTypeId && (() => {
              const analytics = transactionType === 'PAYMENT' ? vendorAnalytics : customerAnalytics
              if (!analytics) return null
              const total = Number(analytics.totalAmount) || 0
              const paid = Number(analytics.paid) || 0
              const pending = Number(analytics.pending) || 0
              const label = transactionType === 'PAYMENT' ? t('form.vendorLedger') : t('form.customerLedger')
              return (
                <div className='rounded-md border bg-muted/40 p-3'>
                  <p className='text-xs font-medium text-muted-foreground mb-2'>{label}</p>
                  <div className='grid grid-cols-3 gap-2 text-center'>
                    <div>
                      <p className='text-[10px] text-muted-foreground uppercase tracking-wide'>{t('form.ledgerTotal')}</p>
                      <p className='text-sm font-semibold tabular-nums'>{fmtAmount(total, { min: 2, max: 2 })}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-muted-foreground uppercase tracking-wide'>{t('form.ledgerPaid')}</p>
                      <p className='text-sm font-semibold tabular-nums text-green-600'>{fmtAmount(paid, { min: 2, max: 2 })}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-muted-foreground uppercase tracking-wide'>{t('form.ledgerPending')}</p>
                      <p className={`text-sm font-semibold tabular-nums ${pending > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{fmtAmount(pending, { min: 2, max: 2 })}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {entityTypeId && (
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.remarks')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('form.remarksPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isPaymentOrReceivable && entityTypeId && (
              <FormItem>
                <FormLabel>{t('form.sourceTransaction')}</FormLabel>
                <Combobox
                  options={sourceTransactionOptions}
                  placeholder={t('form.sourceTransactionPlaceholder')}
                  value={selectedSourceTransactionId}
                  onSelect={handleSourceTransactionSelect}
                  className="w-full"
                  emptyMessage={t('form.sourceTransactionNone')}
                />
              </FormItem>
            )}

            {entityTypeId && (
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
                  // flag uom
                  uomOptions={uomOptions}
                  uomList={uomList}
                  isUomLoading={isUomLoading}
                  uomSearchQueries={uomSearchQueries}
                  setUomSearchQueries={setUomSearchQueries}
                />
              ) : showAmountField ? (
                <AmountField form={form} />
              ) : null
            )}

            {showInventoryFields && entityTypeId && (
              <div className='space-y-2'>
                <p className='text-xs text-muted-foreground font-medium'>{t('form.additionalCosts')}</p>
                <div className='flex items-end gap-4'>
                  {transactionType !== 'SALE' && (
                    <FormField
                      control={form.control}
                      name='cnfCost'
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel>{t('form.cnfCost')}</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              placeholder={t('form.cnfCostPlaceholder')}
                              min={0}
                              step='0.01'
                              value={field.value === 0 ? '' : (field.value ?? '')}
                              onChange={(e) => {
                                const val = e.target.value
                                field.onChange(val === '' ? 0 : parseFloat(val))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name='labourCost'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>{t('form.labourCost')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            placeholder={t('form.labourCostPlaceholder')}
                            min={0}
                            step='0.01'
                            value={field.value === 0 ? '' : (field.value ?? '')}
                            onChange={(e) => {
                              const val = e.target.value
                              field.onChange(val === '' ? 0 : parseFloat(val))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='transportCost'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>{t('form.transportCost')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            placeholder={t('form.transportCostPlaceholder')}
                            min={0}
                            step='0.01'
                            value={field.value === 0 ? '' : (field.value ?? '')}
                            onChange={(e) => {
                              const val = e.target.value
                              field.onChange(val === '' ? 0 : parseFloat(val))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='discount'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>{t('form.discount')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            placeholder={t('form.discountPlaceholder')}
                            min={0}
                            step='0.01'
                            value={field.value === 0 ? '' : (field.value ?? '')}
                            onChange={(e) => {
                              const val = e.target.value
                              field.onChange(val === '' ? 0 : parseFloat(val))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {(showInventoryFields || isPaymentOrReceivable) && entityTypeId && (
              <PaymentFields
                form={form}
                fields={paymentFields}
                onAppend={() => appendPayment({ paymentType: '', amount: 0, remarks: '' })}
                onRemove={removePayment}
                total={
                  isPaymentOrReceivable
                    ? (transactionType === 'PAYMENT'
                        ? Number(vendorAnalytics?.pending) || 0
                        : Number(customerAnalytics?.pending) || 0)
                    : total
                }
                selectedBusinessEntity={selectedBusinessEntity}
                transactionType={transactionType}
                entityBalance={
                  transactionType === 'SALE'
                    ? customerAnalytics?.pending
                    : transactionType === 'PURCHASE'
                    ? vendorAnalytics?.pending
                    : undefined
                }
              />
            )}
          </form>
        </Form>

        <SheetFooter className='flex flex-col gap-3'>
          <div className='flex gap-2'>
            <Button
              form={FORM_ID}
              type='submit'
              variant='outline'
              disabled={isPending}
              className='flex-1'
              onClick={() => { submitModeRef.current = 'invoice' }}
            >
              {isPending && submitModeRef.current === 'invoice' ? t('buttons.saving') : t('buttons.saveAndInvoice')}
            </Button>
            <Button
              form={FORM_ID}
              type='submit'
              disabled={isPending}
              className='flex-1'
              onClick={() => { submitModeRef.current = 'save' }}
            >
              {isPending && submitModeRef.current === 'save' ? t('buttons.saving') : t('buttons.saveChanges')}
            </Button>
            <Button
              form={FORM_ID}
              type='submit'
              variant='outline'
              disabled={isPending}
              className='flex-1'
              onClick={() => { submitModeRef.current = 'thermal' }}
            >
              {isPending && submitModeRef.current === 'thermal' ? t('buttons.saving') : t('buttons.saveAndThermal')}
            </Button>
          </div>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => handleOpenChange(false)}
          >
            {t('buttons.close')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    </>
  )
}

export default TransactionMutateDrawer