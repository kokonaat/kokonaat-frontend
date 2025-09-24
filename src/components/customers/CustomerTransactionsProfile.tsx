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
import { Mail, Phone, MapPin, User } from "lucide-react"
import { useCustomerById, useCustomerTransactions } from "@/hooks/useCustomer"
import CustomerTransactionsTable from "./CustomerTransactionsTable"

const CustomerTransactionsProfile = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const { id } = useParams<{ id: string }>()
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  // Fetch customer info
  const { data: customer, isLoading: isCustomerLoading, isError: isCustomerError } =
    useCustomerById(shopId ?? "", id ?? "")

  // Fetch customer transactions
  const {
    data: transactionsResponse,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useCustomerTransactions(id ?? "", pageIndex, pageSize)

  const transactions = transactionsResponse?.data ?? []
  const total = transactionsResponse?.total ?? 0

  return (
    <CustomersProvider>
      <Main>
        {isCustomerLoading && <p>Loading customer details...</p>}
        {isCustomerError && <p className="text-red-500">Failed to load customer</p>}

        {customer && (
          <Card className="rounded-2xl shadow-sm border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                {customer.name}
              </CardTitle>
              <CardDescription>No: {customer.no}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{customer.email ?? "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{customer.phone ?? "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {[customer.address, customer.city]
                        .filter(Boolean)
                        .join(', ') ||
                        <span className="text-muted-foreground">N/A</span>
                      }
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Shop:</strong>{" "}
                    <span className="text-muted-foreground">{customer.shop?.name}</span>
                  </p>
                  <p>
                    <strong>Business Type:</strong>{" "}
                    {customer.isB2B ? (
                      <Badge variant="default">B2B</Badge>
                    ) : (
                      <Badge variant="secondary">Individual</Badge>
                    )}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {customer.contactPerson || customer.contactPersonPhone ? (
                      customer.contactPerson && customer.contactPersonPhone
                        ? `${customer.contactPerson} (${customer.contactPersonPhone})`
                        : customer.contactPerson || customer.contactPersonPhone
                    ) : (
                      <span className="text-muted-foreground">Not Provided</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Transactions Table */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Transactions</h3>
                {isTransactionsLoading && <p>Loading transactions...</p>}
                {isTransactionsError && (
                  <p className="text-red-500">Failed to load transactions</p>
                )}
                {!isTransactionsLoading && transactions.length > 0 && (
                  <CustomerTransactionsTable
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

export default CustomerTransactionsProfile