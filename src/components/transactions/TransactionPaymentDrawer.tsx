import { useEffect, useMemo } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useTranslation } from '@/hooks/useTranslation'
import { usePaymentTypeOptions } from '@/hooks/useTranslatedOptions'
import { useShopStore } from '@/stores/shopStore'
import { useCreateTransaction } from '@/hooks/useTransaction'
import { Combobox } from '@/components/ui/combobox'
import type { Transaction } from '@/interface/transactionInterface'
import {
  createTransactionPaymentSchema,
  type TransactionPaymentFormValues,
} from '@/schema/transactionPaymentSchema'

interface TransactionPaymentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'pay' | 'collect' | null
  sourceTransaction: Transaction | null
}

const TransactionPaymentDrawer = ({
  open,
  onOpenChange,
  mode,
  sourceTransaction,
}: TransactionPaymentDrawerProps) => {
  const { t } = useTranslation('transactions')
  const { t: tToast } = useTranslation('toast')
  const { t: tValidation } = useTranslation('validation')
  const paymentTypeOptions = usePaymentTypeOptions()
  const schema = useMemo(() => createTransactionPaymentSchema(tValidation), [tValidation])

  const shopId = useShopStore((s) => s.currentShopId) ?? ''
  const { mutate: createTransaction, isPending } = useCreateTransaction(shopId)

  const form = useForm<TransactionPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      paymentType: 'CASH',
      remarks: '',
    },
  })

  useEffect(() => {
    if (!open || !sourceTransaction || !mode) return

    const pending = Number(sourceTransaction.pending ?? 0)
    const partnerName =
      sourceTransaction.vendor?.name || sourceTransaction.customer?.name || ''
    const remarksKey =
      mode === 'pay'
        ? 'paymentDrawer.remarksTemplatePayment'
        : 'paymentDrawer.remarksTemplateCollection'

    form.reset({
      amount: pending > 0 ? pending : 0,
      paymentType: sourceTransaction.paymentType || 'CASH',
      remarks: t(remarksKey, {
        transactionNo: sourceTransaction.no,
        partnerName,
      }),
    })
  }, [open, mode, sourceTransaction, form, t])

  const handleSubmit = (values: TransactionPaymentFormValues) => {
    if (!shopId || !sourceTransaction || !mode) return

    const pending = Number(sourceTransaction.pending ?? 0)
    if (values.amount > pending) {
      toast.error(
        tToast('transaction.exceedsPending', { amount: pending.toFixed(2) })
      )
      return
    }

    const isPay = mode === 'pay'
    const vendorId = sourceTransaction.vendor?.id || sourceTransaction.vendorId
    const customerId = sourceTransaction.customer?.id || sourceTransaction.customerId

    if (isPay && !vendorId) {
      toast.error(tToast('transaction.noVendor'))
      return
    }

    if (!isPay && !customerId) {
      toast.error(tToast('transaction.noCustomer'))
      return
    }

    const payload = isPay
      ? {
          shopId,
          vendorId,
          transactionType: 'PAYMENT' as const,
          paid: values.amount,
          totalAmount: 0,
          paymentType: values.paymentType as Transaction['paymentType'],
          remarks: values.remarks,
        }
      : {
          shopId,
          customerId,
          transactionType: 'RECEIVABLE' as const,
          paid: values.amount,
          totalAmount: 0,
          paymentType: values.paymentType as Transaction['paymentType'],
          remarks: values.remarks,
        }

    createTransaction(payload, {
      onSuccess: () => {
        toast.success(
          isPay
            ? tToast('transaction.vendorPaymentRecorded')
            : tToast('transaction.paymentCollected')
        )
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

  const partnerName =
    sourceTransaction?.vendor?.name || sourceTransaction?.customer?.name
  const pending = Number(sourceTransaction?.pending ?? 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader className="text-start">
          <SheetTitle>
            {mode === 'pay'
              ? t('paymentDrawer.titlePay')
              : t('paymentDrawer.titleCollect')}
          </SheetTitle>
          <SheetDescription>
            {mode === 'pay'
              ? t('paymentDrawer.descriptionPay')
              : t('paymentDrawer.descriptionCollect')}
          </SheetDescription>
        </SheetHeader>

        {sourceTransaction && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {t('paymentDrawer.transaction')}
              </span>
              <span className="font-medium">{sourceTransaction.no}</span>
            </div>
            {partnerName && (
              <div className="mt-1 flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {t('paymentDrawer.partner')}
                </span>
                <span className="truncate font-medium">{partnerName}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between gap-2">
              <span className="text-muted-foreground">
                {t('paymentDrawer.pending')}
              </span>
              <span className="font-medium">{pending.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paymentDrawer.amount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      max={pending || undefined}
                      placeholder={t('form.amountPlaceholder')}
                      value={field.value === 0 ? '' : field.value}
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
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paymentDrawer.paymentType')}</FormLabel>
                  <FormControl>
                    <Combobox
                      options={paymentTypeOptions}
                      placeholder={t('paymentDrawer.paymentTypePlaceholder')}
                      value={field.value}
                      onSelect={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paymentDrawer.remarks')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('paymentDrawer.remarksPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-auto gap-2 px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isPending || pending <= 0}>
                {isPending
                  ? t('buttons.saving')
                  : mode === 'pay'
                    ? t('buttons.recordPayment')
                    : t('buttons.recordCollection')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default TransactionPaymentDrawer
