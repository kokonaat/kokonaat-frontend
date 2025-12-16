import { useCallback, useState } from "react"
import { Main } from "@/components/layout/main"
import { useUomList } from "@/hooks/useUom"
import { useShopStore } from "@/stores/shopStore"
import { UomProvider } from "@/components/uom/uom-provider"
import UomCreateButton from "@/components/uom/UomCreateButton"
import UomTable from "@/components/uom/UomTable"
import UomDialogs from "@/components/uom/UomDialogs"

const Uom = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState("")

  const pageSize = 10

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback(
    (value?: string) => {
      setSearchBy(value || "")
    },
    []
  )

  const { data, isLoading, isError } = useUomList(
    shopId || "",
    pageIndex + 1,
    pageSize,
    searchBy,
  )

  if (isError) return <p>Error loading uoms.</p>

  const uoms = data?.items || []
  const total = data?.total || 0

  return (
    <UomProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Unit of Measurement
            </h2>
            <p className="text-muted-foreground">
              Here is a list of your all Unit of Measurement
            </p>
          </div>
          <UomCreateButton />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <p>Loading uom data...</p>
          ) : (
            <UomTable
              data={uoms}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
            />
          )}
        </div>
      </Main>

      <UomDialogs />
    </UomProvider>
  )
}

export default Uom