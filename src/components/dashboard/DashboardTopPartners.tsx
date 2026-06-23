import { NoDataFound } from '../NoDataFound'
import type { DashboardData } from '@/interface/dashboardInterface'
import { formatCurrency } from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface DashboardTopPartnersProps {
  data?: DashboardData
  isLoading?: boolean
}

const DashboardTopPartners = ({
  data,
  isLoading,
}: DashboardTopPartnersProps) => {
  const { t } = useTranslation('dashboard')
  const customers = data?.topCustomers ?? []
  const vendors = data?.topVendors ?? []

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">{t('charts.loading')}</p>
      </div>
    )
  }

  if (customers.length === 0 && vendors.length === 0) {
    return (
      <NoDataFound
        message={t('charts.topPartners.emptyMessage')}
        details={t('charts.topPartners.emptyDetails')}
      />
    )
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="min-w-0">
        <h4 className="mb-3 text-sm font-semibold">{t('charts.topPartners.topCustomers')}</h4>
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('charts.topPartners.noCustomerSales')}
          </p>
        ) : (
          <ul className="space-y-3">
            {customers.map((customer) => (
              <li
                key={customer.customerId}
                className="flex min-w-0 items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{customer.name}</p>
                  <p className="text-muted-foreground">
                    {t('charts.topPartners.pending', {
                      amount: formatCurrency(customer.pending),
                    })}
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  {formatCurrency(customer.totalSales)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-w-0">
        <h4 className="mb-3 text-sm font-semibold">{t('charts.topPartners.topVendors')}</h4>
        {vendors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('charts.topPartners.noVendorPurchases')}
          </p>
        ) : (
          <ul className="space-y-3">
            {vendors.map((vendor) => (
              <li
                key={vendor.vendorId}
                className="flex min-w-0 items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{vendor.name}</p>
                  <p className="text-muted-foreground">
                    {t('charts.topPartners.pending', {
                      amount: formatCurrency(vendor.pending),
                    })}
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  {formatCurrency(vendor.totalPurchases)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DashboardTopPartners
