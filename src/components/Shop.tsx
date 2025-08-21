import { MoreVertical, ShoppingBag, Pencil } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShopProps } from "@/interface/shopInterface"


const Shop = ({ shop, onEdit }: ShopProps) => {
    return (
        <Card className="list-none rounded-lg border p-4 hover:shadow-md">
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

            <div>
                <h2 className="mb-1 font-semibold">{shop.name}</h2>
                <p className="line-clamp-2 text-gray-500">{shop.address}</p>
            </div>
        </Card>
    )
}

export default Shop
