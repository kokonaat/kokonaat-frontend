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
const VendorTransactionsProfile = lazy(() => import("@/components/vendors/VendorTransactionsProfile"))
const Designation = lazy(() => import("@/pages/Designation"))
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"))
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
                            <Route path="/transaction/customer/:id" element={<CustomerTransactionsProfile />} />
                            <Route path="/vendors" element={<Vendors />} />
                            <Route path="/transaction/vendor/:id" element={<VendorTransactionsProfile />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/users/designation" element={<Designation />} />
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