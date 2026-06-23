import { useState } from "react"
import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { CustomersProvider } from "@/components/customers/customer-provider"
import VendorDialogs from "@/components/vendors/VendorDialogs"
import { useShopStore } from "@/stores/shopStore"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, User, Briefcase, Contact } from "lucide-react"
import { useCustomerById, useCustomerTransactions } from "@/hooks/useCustomer"
import CustomerTransactionsTable from "./CustomerTransactionsTable"
import { useTranslation } from "@/hooks/useTranslation"

const CustomerTransactionsProfile = () => {
  const { t } = useTranslation('customers')
  const { t: tTransactions } = useTranslation('transactions')
  const shopId = useShopStore((s) => s.currentShopId)
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const { id } = useParams<{ id: string }>()
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data: customer, isLoading: isCustomerLoading, isError: isCustomerError } =
    useCustomerById(shopId ?? "", id ?? "")

  const {
    data: transactionsResponse,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useCustomerTransactions(
    id ?? "",
    pageIndex,
    pageSize,
    startDate,
    endDate
  )

  const transactions = transactionsResponse?.data ?? []
  const total = transactionsResponse?.total ?? 0

  return (
    <CustomersProvider>
      <Main>
        {isCustomerLoading && <p>{t('ledger.loadingDetails')}</p>}
        {isCustomerError && <p className="text-red-500">{t('profile.failedToLoad')}</p>}

        {customer && (
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                {customer.name}
              </CardTitle>
              <CardDescription>
                {t('ledger.noLabel')} {customer.no}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Contact className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {t('profile.contactInformation')}
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {customer.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{t('profile.email')}</p>
                          <p className="text-sm font-medium break-all">{customer.email}</p>
                        </div>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{t('profile.phone')}</p>
                          <p className="text-sm font-medium">{customer.phone}</p>
                        </div>
                      </div>
                    )}
                    {(customer.address || customer.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{t('profile.address')}</p>
                          <p className="text-sm font-medium">
                            {[customer.address, customer.city].filter(Boolean).join(", ") || tTransactions('table.columns.notAvailable')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {t('profile.businessDetails')}
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {customer.shop?.name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{t('profile.shop')}</p>
                        <p className="text-sm font-medium">{customer.shop.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">{t('profile.businessType')}</p>
                      {customer.isB2B ? (
                        <Badge variant="default" className="text-xs">{t('profile.b2b')}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{t('profile.individual')}</Badge>
                      )}
                    </div>
                    {(customer.contactPerson || customer.contactPersonPhone) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{t('profile.contactPerson')}</p>
                        <p className="text-sm font-medium">
                          {customer.contactPerson && customer.contactPersonPhone
                            ? `${customer.contactPerson} (${customer.contactPersonPhone})`
                            : customer.contactPerson || customer.contactPersonPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">{t('profile.transactions')}</h3>
                {isTransactionsLoading && <p>{t('ledger.loadingTransactions')}</p>}
                {isTransactionsError && (
                  <p className="text-red-500">{t('profile.failedTransactions')}</p>
                )}
                {!isTransactionsLoading && transactions.length > 0 && (
                  <CustomerTransactionsTable
                    data={transactions}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                    onDateChange={(from, to) => {
                      setStartDate(from)
                      setEndDate(to)
                    }}
                  />
                )}
                {!isTransactionsLoading && transactions.length === 0 && (
                  <p>{t('ledger.emptyMessage')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Main>

      <VendorDialogs />
    </CustomersProvider>
  )
}

export default CustomerTransactionsProfile
