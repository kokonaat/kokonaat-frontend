import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuideStore {
  dismissed: Record<string, boolean>
  dismiss: (shopId: string) => void
  isDismissed: (shopId: string) => boolean
}

export const useGuideStore = create<GuideStore>()(
  persist(
    (set, get) => ({
      dismissed: {},
      dismiss: (shopId) =>
        set((s) => ({ dismissed: { ...s.dismissed, [shopId]: true } })),
      isDismissed: (shopId) => !!get().dismissed[shopId],
    }),
    { name: 'kokonaat-guide-v2' },
  ),
)
