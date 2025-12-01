import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, ShoppingBag, Pencil } from "lucide-react"
import type { ShopProps } from "@/interface/shopInterface"
import { useShopStore } from "@/stores/shopStore"
import { useUser } from "@/hooks/useUser"

const ShopCard = ({ shop, onEdit }: ShopProps) => {
    const setCurrentShopId = useShopStore((s) => s.setCurrentShopId)
    const { data: user } = useUser()

    // find role for this shop from user data
    const userRole = user?.shopWiseUserRoles.find(
        (s) => s.shopId === shop.shopId
    )?.role

    return (
        <Card
            onClick={() => {
                if (shop.shopId) setCurrentShopId(shop.shopId)
            }}
            className="list-none relative rounded-lg border p-4 hover:shadow-md cursor-pointer"
        >
            {/* top row: icon & menu */}
            <div className="mb-4 ml-2 flex items-start justify-between">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg p-2">
                    <ShoppingBag className="h-6 w-6" />
                </div>

                {/* edit dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(shop)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* shop info */}
            <div className="min-h-20 flex flex-col gap-1">
                {/* role badge */}
                {userRole && (
                    <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 mt-1 w-max text-left"
                    >
                        {userRole.name.replace("_", " ")}
                    </Badge>
                )}

                <h2 className="font-semibold truncate ml-2" title={shop.shopName}>
                    {shop.shopName}
                </h2>

                <p
                    className="text-gray-500 overflow-hidden text-ellipsis line-clamp-2 ml-2"
                    title={shop.shopAddress || ""}
                >
                    {shop.shopAddress || "no address provided"}
                </p>
            </div>
        </Card>
    )
}

export default ShopCard