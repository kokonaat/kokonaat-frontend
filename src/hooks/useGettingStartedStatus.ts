import { useMemo } from 'react'
import { useVendorList } from './useVendor'
import { useCustomerList } from './useCustomer'
import { useTransactionList } from './useTransaction'
import { useShopStore } from '@/stores/shopStore'

export interface GettingStartedStatus {
  hasVendor: boolean
  hasPurchase: boolean
  hasCustomer: boolean
  hasSale: boolean
  isComplete: boolean
  isLoading: boolean
}

export function useGettingStartedStatus(): GettingStartedStatus {
  const shopId = useShopStore((s) => s.currentShopId) ?? ''

  const { data: vendorData, isLoading: vendorLoading } = useVendorList(shopId, 1, 1, undefined, undefined, undefined, { enabled: !!shopId })
  const { data: customerData, isLoading: customerLoading } = useCustomerList(shopId, 1, 1, undefined, undefined, undefined, { enabled: !!shopId })
  const { data: purchaseData, isLoading: purchaseLoading } = useTransactionList(shopId, 1, 1, undefined, undefined, undefined, ['PURCHASE'], undefined, undefined)
  const { data: saleData, isLoading: saleLoading } = useTransactionList(shopId, 1, 1, undefined, undefined, undefined, ['SALE'], undefined, undefined)

  return useMemo(() => {
    const hasVendor = (vendorData?.total ?? 0) > 0
    const hasCustomer = (customerData?.total ?? 0) > 0
    const hasPurchase = (purchaseData?.total ?? 0) > 0
    const hasSale = (saleData?.total ?? 0) > 0
    const isLoading = !shopId ? false : (vendorLoading || customerLoading || purchaseLoading || saleLoading)
    return {
      hasVendor,
      hasCustomer,
      hasPurchase,
      hasSale,
      isComplete: hasVendor && hasPurchase && hasCustomer && hasSale,
      isLoading,
    }
  }, [shopId, vendorData, customerData, purchaseData, saleData, vendorLoading, customerLoading, purchaseLoading, saleLoading])
}
