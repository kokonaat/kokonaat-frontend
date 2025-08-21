import { useState } from "react"
import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Shop } from "@/interface/shopInterface"
import ShopCard from "@/components/Shop"
import ShopDrawer from "@/components/ShopDrawer"

const Shops = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [currentShop, setCurrentShop] = useState<Shop | undefined>(undefined)

    const demoShops: Shop[] = [
        { id: "1", name: "Demo Shop 1", address: "123 Street, City" },
        { id: "2", name: "Demo Shop 2", address: "456 Avenue, City" },
        { id: "3", name: "Demo Shop 3", address: "789 Boulevard, City" },
        { id: "4", name: "Demo Shop 4", address: "101 Road, City" },
    ]

    return (
        <div>
            <Header>
                <Search />
                <div className="ms-auto flex items-center gap-4">
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main fixed className="flex flex-col h-[calc(100svh-4rem)]">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold tracking-tight">Your Shop's</h1>
                            <p className="text-muted-foreground">
                                Here's a list of your shops!
                            </p>
                        </div>
                        <Input placeholder="Search your shop" className="h-9 w-40 lg:w-[250px]" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            className="space-x-1"
                            onClick={() => {
                                setCurrentShop(undefined)
                                setDrawerOpen(true)
                            }}
                        >
                            <span>Create</span>
                            <Plus size={18} />
                        </Button>
                    </div>
                </div>

                <Separator className="shadow-sm" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                    {demoShops.map((shop) => (
                        <ShopCard
                            key={shop.id}
                            shop={shop}
                            onEdit={(s) => {
                                setCurrentShop(s)
                                setDrawerOpen(true)
                            }}
                        />
                    ))}
                </div>
            </Main>

            <ShopDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                currentShop={currentShop}
            />
        </div>
    )
}

export default Shops