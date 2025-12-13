// import { useState } from 'react'
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerDescription,
// } from '@/components/ui/drawer'
// import { useTrackInventoryById } from '@/hooks/useInventory'
// import { useShopStore } from '@/stores/shopStore'
// // import InventoryDetailsTrackingTable from './InventoryDetailsTrackingTable'
// import { NoDataFound } from '../NoDataFound'
// import type { UomFormInterface } from '@/interface/uomInterface'

// type UomViewDrawerProps = {
//   open: boolean
//   onOpenChange: (val: boolean) => void
//   currentRow: UomFormInterface | null
// }

// const UomViewDrawer = ({
//   open,
//   onOpenChange,
//   currentRow,
// }: UomViewDrawerProps) => {
//   // Hooks MUST run unconditionally
//   const shopId = useShopStore((s) => s.currentShopId)

//   const inventoryId = currentRow?.id ?? ''

//   const [pageIndex, _setPageIndex] = useState(0)
//   const pageSize = 10

//   const { data, isLoading, isError } = useTrackInventoryById(
//     inventoryId,
//     shopId,
//     pageIndex + 1,
//     pageSize
//   )

//   // Now we can safely stop UI rendering
//   if (!currentRow) return null

//   return (
//     <Drawer open={open} onOpenChange={onOpenChange}>
//       <DrawerContent className="max-w-2xl mx-auto p-6 space-y-6">
//         <DrawerHeader>
//           <DrawerTitle className="text-lg font-semibold">
//             Details
//           </DrawerTitle>
//           <DrawerDescription className="text-sm text-muted-foreground">
//             View information for{' '}
//             <span className="font-medium">{currentRow.name}</span>
//           </DrawerDescription>
//         </DrawerHeader>

//         <hr className="my-4 border-gray-200" />

//         <h3 className="text-md font-semibold mb-2">Tracking</h3>

//         {isLoading && (
//           <p className="text-sm text-muted-foreground">
//             Loading tracking data...
//           </p>
//         )}

//         {isError && (
//           <p className="text-sm text-red-500">Error loading tracking data</p>
//         )}

//         {!isLoading && data && data.items.length === 0 && (
//           <NoDataFound message="No tracking records found!" />
//         )}

//         {/* {!isLoading && data && data.items.length > 0 && (
//           <InventoryDetailsTrackingTable
//             data={data.items}
//             pageIndex={pageIndex}
//             pageSize={pageSize}
//             total={data.total}
//             onPageChange={(newPage) => setPageIndex(newPage)}
//           />
//         )} */}
//       </DrawerContent>
//     </Drawer>
//   )
// }

// export default UomViewDrawer