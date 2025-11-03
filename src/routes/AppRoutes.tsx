import { Suspense, lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import ProtectedRoute from "./ProtectedRoute"
import AuthenticatedLayout from "@/components/layout/authenticated-layout"
import Loader from "@/components/layout/Loader"
import { useUser } from "@/hooks/useUser"

// Lazy load pages
const SignIn = lazy(() => import("@/pages/SignIn"))
const SignUp = lazy(() => import("@/pages/SignUp"))
const CreateShop = lazy(() => import("@/pages/CreateShop"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Shops = lazy(() => import("@/pages/Shops"))
const Customers = lazy(() => import("@/pages/Customers"))
const CustomerTransactionsProfile = lazy(() => import("@/components/customers/CustomerTransactionsProfile"))
const Vendors = lazy(() => import("@/pages/Vendors"))
const Inventory = lazy(() => import("@/pages/Inventory"))
const VendorTransactionsProfile = lazy(() => import("@/components/vendors/VendorTransactionsProfile"))
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"))
const TransactionDetails = lazy(() => import("@/components/transactions/TransactionDetails"))
const Settings = lazy(() => import("@/features/settings"))
const ComingSoon = lazy(() => import("@/components/coming-soon"))
const Users = lazy(() => import("@/features/users"))

const AppRoutes = () => {
    // calling user api to avoid to get null where user's data needed
    useUser()

    return (
        <>
            <Toaster position="top-center" />
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/create-shop" element={<CreateShop />} />
                        <Route element={<AuthenticatedLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/shops" element={<Shops />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/customer/:id" element={<CustomerTransactionsProfile />} />
                            <Route path="/vendors" element={<Vendors />} />
                            <Route path="/vendor/:id" element={<VendorTransactionsProfile />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/transactions/:id" element={<TransactionDetails />} />
                            <Route path="/users/employee" element={<Users />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/help-center" element={<ComingSoon />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </>
    )
}

export default AppRoutes