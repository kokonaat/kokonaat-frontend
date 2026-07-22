import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, ShoppingBag, Pencil, CheckCheck, Trash2 } from "lucide-react"
import type { ShopProps } from "@/interface/shopInterface"
import { useShopStore } from "@/stores/shopStore"
import { useUser } from "@/hooks/useUser"
import { useDeleteShop } from "@/hooks/useShop"
import { useTranslation } from "@/hooks/useTranslation"

const ShopCard = ({ shop, onEdit }: ShopProps) => {
    const { t } = useTranslation('shops')
    const currentShopId = useShopStore((s) => s.currentShopId)
    const setCurrentShop = useShopStore((s) => s.setCurrentShop)
    const { data: user } = useUser()
    const { mutate: deleteShopMutate, isPending: isDeleting } = useDeleteShop()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const isActive = currentShopId === shop.shopId

    const userRole = user?.shopWiseUserRoles.find(
        (s) => s.shop?.id === shop.shopId
    )?.role

    const isOwner = userRole?.name === 'shop_owner'

    const handleDeleteConfirm = () => {
        if (shop.shopId) {
            deleteShopMutate(shop.shopId)
        }
        setShowDeleteDialog(false)
    }

    return (
        <>
            <Card
                onClick={() => {
                    if (shop.shopId && !isActive) {
                        setCurrentShop(
                            shop.shopId,
                            shop.shopName,
                            undefined,
                            userRole?.name,
                        )
                    }
                }}
                className={`list-none relative rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                    isActive
                        ? "border-muted-foreground/30"
                        : "hover:shadow-sm border-border hover:border-muted-foreground/30"
                }`}
            >
                <div className="mb-4 ml-2 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg p-2 bg-muted text-muted-foreground">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        {isActive && (
                            <span className="text-sm flex items-center gap-1 text-muted-foreground font-semibold">
                                <CheckCheck className="h-4 w-4" />
                                {t('card.selected')}
                            </span>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(shop)
                                }}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('buttons.edit')}
                            </DropdownMenuItem>
                            {isOwner && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowDeleteDialog(true)
                                        }}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('buttons.delete')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="min-h-20 flex flex-col gap-1">
                    {userRole && (
                        <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 mt-1 w-max text-left"
                        >
                            {userRole.name.replace("_", " ")}
                        </Badge>
                    )}

                    <h2
                        className="font-semibold truncate ml-2"
                        title={shop.shopName}
                    >
                        {shop.shopName}
                    </h2>

                    <p
                        className="text-gray-500 overflow-hidden text-ellipsis line-clamp-2 ml-2"
                        title={shop.shopAddress || ""}
                    >
                        {shop.shopAddress || t('card.noAddress')}
                    </p>
                </div>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteDialog.description', { name: shop.shopName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {t('deleteDialog.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default ShopCard
