import { ConfirmDialog } from "@/components/confirm-dialog"
import { useDeleteSubscriptionPlan } from "@/hooks/usePlans"
import type { SubscriptionPlanInterface } from "@/interface/subscriptionInterface"

type SubscriptionPlanDeleteDialogProps = {
  currentPlan: SubscriptionPlanInterface | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SubscriptionPlanDeleteDialog = ({
  currentPlan,
  open,
  onOpenChange,
}: SubscriptionPlanDeleteDialogProps) => {
  const deleteMutation = useDeleteSubscriptionPlan()

  if (!currentPlan) return null

  const isLoading = deleteMutation.status === 'pending'

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete Subscription Plan: ${currentPlan.name}?`}
      desc={
        <>
          You are about to delete the subscription plan{" "}
          <strong>{currentPlan.name}</strong>. <br />
          This action cannot be undone.
        </>
      }
      confirmText="Delete"
      handleConfirm={() => {
        deleteMutation.mutate(currentPlan.id, {
          onSuccess: () => {
            onOpenChange(false) // close dialog after success
          },
        })
      }}
      className="max-w-md"
      isLoading={isLoading}
    />
  )
}