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
import TransactionLedgerTable from "./TransactionLedgerTable"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomerById } from "@/hooks/useCustomer"
import { useVendorById } from "@/hooks/useVendor"
import { Mail, MapPin, Phone, User, Building2 } from "lucide-react"
import { Badge } from "../ui/badge"

const TransactionLedger = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const { id: entityId } = useParams<{ id: string }>()
  const [pageIndex, setPageIndex] = useState(0)
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const pageSize = 10

  // api calls
  const { data, isLoading, isError } = useTransactionLedger(
    shopId ?? "",
    pageIndex + 1,
    entityId ?? "",
    pageSize,
    undefined,
    startDate,
    endDate
  )

  const { data: customer, isLoading: isCustomerLoading } = useCustomerById(
    shopId ?? "",
    entityId ?? ""
  )
  const { data: vendor, isLoading: isVendorLoading } = useVendorById(
    shopId ?? "",
    entityId ?? ""
  )

  const isCustomer = Boolean(customer && !vendor)
  const entity = customer || vendor

  const transactions = data?.transactions ?? []
  const total = data?.total ?? 0
  const totalAmount = data?.totalAmount ?? 0
  const totalPaid = data?.totalPaid ?? 0
  const totalAdvancePaid = data?.totalAdvancePaid ?? 0
  const totalPending = data?.totalPending ?? 0
  const totalCombinedPaid = totalPaid + totalAdvancePaid

  if (isCustomerLoading || isVendorLoading) {
    return <p>Loading details...</p>
  }

  if (!entity) {
    return <p className="text-red-500">No customer or vendor found.</p>
  }

  return (
    <CustomersProvider>
      <Main>
        <div className="space-y-6">
          {/* Customer/Vendor Card */}
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                {isCustomer ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
                {entity.name}
              </CardTitle>
              <CardDescription>
                No: {entity.no || <span className="text-muted-foreground">N/A</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Section */}
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{entity.email ?? "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{entity.phone ?? "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {[entity.address, entity.city]
                        .filter(Boolean)
                        .join(", ") || (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                    </span>
                  </p>
                </div>

                {/* Right Section */}
                <div className="space-y-2">
                  {isCustomer && (
                    <>
                      <p>
                        <strong>Shop:</strong>{" "}
                        <span className="text-muted-foreground">
                          {entity.shop?.name ?? "N/A"}
                        </span>
                      </p>
                      <p>
                        <strong>Business Type:</strong>{" "}
                        {entity.isB2B ? (
                          <Badge variant="default">B2B</Badge>
                        ) : (
                          <Badge variant="secondary">Individual</Badge>
                        )}
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {entity.contactPerson || entity.contactPersonPhone ? (
                      entity.contactPerson && entity.contactPersonPhone
                        ? `${entity.contactPerson} (${entity.contactPersonPhone})`
                        : entity.contactPerson || entity.contactPersonPhone
                    ) : (
                      <span className="text-muted-foreground">Not Provided</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Info */}
          {
            transactions && transactions.length > 0 ? (
              <Card className="rounded-2xl shadow-sm border bg-card">
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold">
                        {isCustomer ? "Customer Ledger" : "Vendor Ledger"}
                      </h3>

                      {isLoading ? (
                        <div className="flex flex-wrap gap-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-semibold">{totalAmount}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                            <span className="text-sm">Paid</span>
                            <span className="font-semibold">{totalCombinedPaid}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-red-100 text-red-700 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                            <span className="text-sm">Pending</span>
                            <span className="font-semibold">{totalPending}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {isLoading ? (
                      <p>Loading transactions...</p>
                    ) : isError ? (
                      <p className="text-red-500">Failed to load transactions</p>
                    ) : transactions.length === 0 ? (
                      <p>No transactions found</p>
                    ) : (
                      <TransactionLedgerTable
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
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-center text-muted-foreground mt-4">
                No transaction found
              </p>
            )
          }
        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default TransactionLedger