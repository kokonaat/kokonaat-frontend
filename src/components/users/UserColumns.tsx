import { useMemo } from 'react'
import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LongText } from "@/components/long-text"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"
import type { UserListItem } from "@/interface/userInterface"
import { useTranslation } from '@/hooks/useTranslation'

export function useUsersColumns(): ColumnDef<UserListItem>[] {
    const { t } = useTranslation('users')

    return useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label={t('table.columns.selectAll')}
                        className="translate-y-0.5"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={t('table.columns.selectRow')}
                        className="translate-y-0.5"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t('table.columns.name')} />
                ),
                cell: ({ row }) => <LongText>{row.getValue("name")}</LongText>,
            },
            {
                accessorKey: "phone",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t('table.columns.phone')} />
                ),
                cell: ({ row }) => <div>{row.getValue("phone")}</div>,
            },
            {
                id: "role",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t('table.columns.role')} />
                ),
                cell: ({ row }) => {
                    const roles = row.original.shopWiseUserRoles
                    const roleName = roles?.[0]?.role?.name ?? "N/A"
                    return <Badge variant="outline">{roleName}</Badge>
                },
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t('table.columns.createdAt')} />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.getValue("createdAt"))
                    return <span>{date.toLocaleDateString()}</span>
                },
            },
            {
                id: "actions",
                cell: (props) => <DataTableRowActions<UserListItem> {...props} />,
            },
        ],
        [t],
    )
}
