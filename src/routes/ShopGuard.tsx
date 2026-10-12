import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useShopList } from "@/hooks/useShop"
import Loader from "@/components/layout/Loader"

/**
 * Sits between ProtectedRoute and the app shell.
 *
 * Rules:
 *   • No shops → always send to /create-shop (even if the user manually types another URL)
 *   • Has shops → send away from /create-shop back to /
 *   • While loading → show a loader (never flash the wrong page)
 *   • API error  → render the outlet as-is (don't lock the user out on a network blip)
 */
const ShopGuard = () => {
    const { data: shops, isPending, isError } = useShopList()
    const { pathname } = useLocation()

    if (isPending) return <Loader />
    if (isError) return <Outlet />

    const hasShop = (shops?.length ?? 0) > 0
    const isOnCreateShop = pathname === "/create-shop"

    if (!hasShop && !isOnCreateShop) {
        return <Navigate to="/create-shop" replace />
    }

    if (hasShop && isOnCreateShop) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ShopGuard
