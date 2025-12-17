import { useState } from "react"
import { Main } from "@/components/layout/main"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useSubscriptionList } from "@/hooks/usePlans"
import SubscriptionPlanCard from "@/components/plans/SubscriptionPlanCard"
import SubscriptionPlanMutateDrawer from "@/components/plans/SubscriptionPlanMutateDrawer"
import type { SubscriptionPlanInterface } from "@/interface/subscriptionInterface"
import { SubscriptionPlanDeleteDialog } from "@/components/plans/SubscriptionPlanDeleteDialogs"

const Plans = () => {
  const { data, isLoading } = useSubscriptionList()
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlanInterface | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Here is a list of all your subscription plans
          </p>
        </div>

        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setCurrentPlan(null) // reset for create
            setDrawerOpen(true)
          }}
        >
          Create Plan
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Loading / empty */}
      {isLoading && <p className="text-muted-foreground">Loading plans...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-muted-foreground">No subscription plans found.</p>
      )}

      {/* Plan Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            onEdit={(plan) => {
              setCurrentPlan(plan)
              setDrawerOpen(true)
            }}
            onDelete={(planId) => {
              const planToDelete = data.find((p) => p.id === planId) || null
              setCurrentPlan(planToDelete)
              setDeleteOpen(true)
            }}
          />
        ))}
      </div>

      {/* Create / Edit Drawer */}
      <SubscriptionPlanMutateDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currentPlan={currentPlan}
      />

      {/* Delete Confirmation */}
      <SubscriptionPlanDeleteDialog
        currentPlan={currentPlan}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </Main>
  )
}

export default Plans