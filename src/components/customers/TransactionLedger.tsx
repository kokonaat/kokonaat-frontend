import { useState } from "react"
import { useParams } from "react-router-dom"
import { Mail, MapPin, Phone, User, Building2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { generatePDF } from "@/utils/enums/pdf"
import type { Entity } from "@/utils/enums/pdf"
import { Main } from "@/components/layout/main"
import { CustomersProvider } from "@/components/customers/customer-provider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import VendorDialogs from "@/components/vendors/VendorDialogs"
import { useShopStore } from "@/stores/shopStore"
import TransactionLedgerTable from "./TransactionLedgerTable"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { useCustomerById } from "@/hooks/useCustomer"
import { useVendorById } from "@/hooks/useVendor"

const TransactionLedger = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  // Now we have the type in URL
  const { id: entityId, type } = useParams<{ id: string; type: "vendor" | "customer" }>()

  const [pageIndex, setPageIndex] = useState(0)
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const pageSize = 10

  const isVendor = type === "vendor"
  const isCustomer = type === "customer"

  // always call hooks — only one will execute due to enabled flag
  const {
    data: customer,
    isLoading: isCustomerLoading,
  } = useCustomerById(shopId ?? "", entityId ?? "", {
    enabled: isCustomer, // only run customer API when type = "customer"
  })

  const {
    data: vendor,
    isLoading: isVendorLoading,
  } = useVendorById(shopId ?? "", entityId ?? "", {
    enabled: isVendor, // only run vendor API when type = "vendor"
  })

  // choose correct entity
  const entity = customer || vendor

  // ledger fetch (shared)
  const { data, isLoading, isError } = useTransactionLedger(
    shopId ?? "",
    pageIndex + 1,
    entityId ?? "",
    pageSize,
    undefined,
    startDate,
    endDate
  )

  const transactions = data?.transactions ?? []
  const total = data?.total ?? 0
  const totalAmount = data?.totalAmount ?? 0
  const totalPaid = data?.totalPaid ?? 0
  const totalAdvancePaid = data?.totalAdvancePaid ?? 0
  const totalPending = data?.totalPending ?? 0
  const totalCombinedPaid = totalPaid + totalAdvancePaid

  // loading handler
  if (isCustomerLoading || isVendorLoading) {
    return <p>Loading details...</p>
  }

  // no entity found
  if (!entity) {
    return (
      <p className="text-red-500 text-center mt-4">
        No {type} found.
      </p>
    )
  }

  return (
    <CustomersProvider>
      <Main>
        <div className="space-y-6">

          {/* entity info card */}
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

                {/* left */}
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
                      {[entity.address, entity.city].filter(Boolean).join(", ") ||
                        <span className="text-muted-foreground">N/A</span>
                      }
                    </span>
                  </p>
                </div>

                {/* right */}
                <div className="space-y-2">
                  {isCustomer && (
                    <>
                      <p><strong>Shop:</strong> {entity.shop?.name ?? "N/A"}</p>

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

          {/* ledger section */}
          {transactions.length > 0 && (
            <Card className="rounded-2xl shadow-sm border bg-card">
              <CardContent className="space-y-6">
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

                      <button
                        onClick={() => generatePDF(entity as Entity, transactions, {
                          totalAmount,
                          totalPaid,
                          totalAdvancePaid,
                          totalPending
                        })}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Download PDF Report
                      </button>
                    </div>
                  )}
                </div>

                {/* table */}
                {isLoading ? (
                  <p>Loading transactions...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load transactions</p>
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
              </CardContent>
            </Card>
          )}

          {/* if no transactions */}
          {transactions.length === 0 && !isLoading && (
            <Card className="rounded-2xl shadow-sm border bg-card">
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold">
                    {isCustomer ? "Customer Ledger" : "Vendor Ledger"}
                  </h3>
                </div>

                {/* table */}
                {isLoading ? (
                  <p>Loading transactions...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load transactions</p>
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
              </CardContent>
            </Card>
          )}

        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default TransactionLedger