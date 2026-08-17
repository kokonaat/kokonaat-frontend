import { useState } from "react"
import { useParams } from "react-router-dom"
import { Main } from "@/components/layout/main"
import { CustomersProvider } from "@/components/customers/customer-provider"
import VendorDialogs from "@/components/vendors/VendorDialogs"
import VendorTransactionsTable from "./VendorTransactionsTable"
import { useShopStore } from "@/stores/shopStore"
import { useVendorAnalytics, useVendorById, useVendorTransactions } from "@/hooks/useVendor"
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
import { fmtAmount } from "@/lib/utils"

const VendorTransactionsProfile = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const { id } = useParams<{ id: string }>()
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  // Fetch vendor info
  const { data: vendor, isLoading: isVendorLoading, isError: isVendorError } =
    useVendorById(shopId ?? "", id ?? "")

  // Fetch vendor transactions
  const {
    data: transactionsResponse,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useVendorTransactions(id ?? "", pageIndex, pageSize)

  const transactions = transactionsResponse?.data ?? []
  const total = transactionsResponse?.total ?? 0

  const { data: analytics } = useVendorAnalytics(id ?? "")

  return (
    <CustomersProvider>
      <Main>
        {isVendorLoading && <p>Loading vendor details...</p>}
        {isVendorError && <p className="text-red-500">Failed to load vendor</p>}

        {vendor && (
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                {vendor.name}
              </CardTitle>
              <CardDescription>No: {vendor.no}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Contact className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Contact Information
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {vendor.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="text-sm font-medium break-all">{vendor.email}</p>
                        </div>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="text-sm font-medium">{vendor.phone}</p>
                        </div>
                      </div>
                    )}
                    {(vendor.address || vendor.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                          <p className="text-sm font-medium">
                            {[vendor.address, vendor.city].filter(Boolean).join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Business Details
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {vendor.shop?.name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Shop</p>
                        <p className="text-sm font-medium">{vendor.shop.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Business Type</p>
                      {vendor.isB2B ? (
                        <Badge variant="default" className="text-xs">B2B</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Individual</Badge>
                      )}
                    </div>
                    {(vendor.contactPerson || vendor.contactPersonPhone) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Contact Person</p>
                        <p className="text-sm font-medium">
                          {vendor.contactPerson && vendor.contactPersonPhone
                            ? `${vendor.contactPerson} (${vendor.contactPersonPhone})`
                            : vendor.contactPerson || vendor.contactPersonPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(analytics.openingBalance ?? 0) > 0 && (
                    <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center col-span-2 lg:col-span-4">
                      <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">{fmtAmount(analytics.openingBalance ?? 0, { min: 2 })}</p>
                    </div>
                  )}
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
                    <p className="text-lg font-semibold">{fmtAmount(analytics.totalAmount ?? 0, { min: 2 })}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Paid</p>
                    <p className="text-lg font-semibold text-green-600">{fmtAmount(analytics.paid ?? 0, { min: 2 })}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Outstanding (Payable)</p>
                    <p className="text-lg font-semibold text-red-500">{fmtAmount(analytics.pending ?? 0, { min: 2 })}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                    <p className="text-lg font-semibold">{analytics.totalTransactions ?? 0}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Transactions Table */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Transactions</h3>
                {isTransactionsLoading && <p>Loading transactions...</p>}
                {isTransactionsError && (
                  <p className="text-red-500">Failed to load transactions</p>
                )}
                {!isTransactionsLoading && transactions.length > 0 && (
                  <VendorTransactionsTable
                    data={transactions}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                  />
                )}
                {!isTransactionsLoading && transactions.length === 0 && (
                  <p>No transactions found.</p>
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

export default VendorTransactionsProfile