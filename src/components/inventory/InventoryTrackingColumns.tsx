import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InventoryTrackingItemInterface } from '@/interface/inventoryInterface'
import { useTranslation } from '@/hooks/useTranslation'

export function useInventoryTrackingColumns(): ColumnDef<InventoryTrackingItemInterface>[] {
  const { t } = useTranslation('inventory')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      {
        accessorKey: 'inventory.name',
        header: t('trackingTable.columns.inventoryName'),
        cell: ({ row }) => row.original.inventory.name,
      },
      {
        accessorKey: 'isPurchased',
        header: t('trackingTable.columns.type'),
        cell: ({ getValue }) => {
          const isPurchased = getValue<boolean>()
          return tEnums(`stockTrackType.${isPurchased ? 'PURCHASE' : 'SALE'}`)
        },
      },
      {
        accessorKey: 'stock',
        header: t('trackingTable.columns.stock'),
      },
      {
        accessorKey: 'price',
        header: t('trackingTable.columns.price'),
        cell: ({ getValue }) => `${getValue<number>()}`,
      },
      {
        accessorKey: 'createdAt',
        header: t('trackingTable.columns.createdAt'),
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
    ],
    [t, tEnums]
  )
}
