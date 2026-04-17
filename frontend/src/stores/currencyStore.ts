import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Currency = 'KRW' | 'USD' | 'JPY' | 'BTC'

interface CurrencyState {
  currency: Currency
  hidden: boolean
  setCurrency: (currency: Currency) => void
  toggleHidden: () => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'KRW',
      hidden: false,
      setCurrency: (currency) => set({ currency }),
      toggleHidden: () => set((state) => ({ hidden: !state.hidden })),
    }),
    { name: 'bitmoa-currency' }
  )
)
