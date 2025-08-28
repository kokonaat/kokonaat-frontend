import { Suspense, lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import ProtectedRoute from "./ProtectedRoute"
import AuthenticatedLayout from "@/components/layout/authenticated-layout"
import Loader from "@/components/layout/Loader"

// Lazy load pages
const SignIn = lazy(() => import("@/pages/SignIn"))
const SignUp = lazy(() => import("@/pages/SignUp"))
const CreateShop = lazy(() => import("@/pages/CreateShop"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Shops = lazy(() => import("@/pages/Shops"))
const Customers = lazy(() => import("@/pages/Customers"))
const Vendors = lazy(() => import("@/pages/Vendors"))
const Designation = lazy(() => import("@/pages/Designation"))
const Apps = lazy(() => import("@/features/apps"))
const ForgotPassword = lazy(() => import("@/features/auth/forgot-password"))
const Otp = lazy(() => import("@/features/auth/otp"))
const Settings = lazy(() => import("@/features/settings"))
const ComingSoon = lazy(() => import("@/components/coming-soon"))
const Users = lazy(() => import("@/features/users"))

const AppRoutes = () => {
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
                            <Route path="/vendors" element={<Vendors />} />
                            <Route path="/users/designation" element={<Designation />} />
                            <Route path="/users/employee" element={<Users />} />
                            <Route path="/apps" element={<Apps />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/otp" element={<Otp />} />
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