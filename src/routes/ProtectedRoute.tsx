import { useAuthStore } from "@/stores/authStore"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />
}

export default ProtectedRoute