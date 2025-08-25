export const getCurrentShopId = (): string | null => {
    const lsData = localStorage.getItem("shop-storage")
    if (!lsData) return null
    try {
        const parsed = JSON.parse(lsData)
        return parsed.state?.currentShopId || null
    } catch {
        return null
    }
}