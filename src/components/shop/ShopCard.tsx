import { MoreVertical, ShoppingBag, Pencil } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ShopProps } from "@/interface/shopInterface"
import { useShopStore } from "@/stores/shopStore"

const ShopCard = ({ shop, onEdit }: ShopProps) => {
    const setCurrentShopId = useShopStore((s) => s.setCurrentShopId)

    return (
        <Card
            onClick={() => {
                if (shop.id) setCurrentShopId(shop.id)
            }}
            className="list-none rounded-lg border p-4 hover:shadow-md cursor-pointer"
        >
            <div className="mb-8 flex items-center justify-between">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg p-2">
                    <ShoppingBag className="h-6 w-6" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => onEdit(shop)}
                            className="cursor-pointer"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="min-h-20">
                <h2 className="mb-1 font-semibold truncate" title={shop.name}>
                    {shop.name}
                </h2>
                <p
                    className="text-gray-500 overflow-hidden text-ellipsis line-clamp-2"
                    title={shop.address ?? ''}
                >
                    {shop.address ?? 'No address provided'}
                </p>
            </div>
        </Card>
    )
}

export default ShopCard
