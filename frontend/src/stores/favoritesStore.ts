import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  markets: string[]
  toggle: (market: string) => void
  isFavorite: (market: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      markets: [],
      toggle: (market) =>
        set((state) => ({
          markets: state.markets.includes(market)
            ? state.markets.filter((m) => m !== market)
            : [...state.markets, market],
        })),
      isFavorite: (market) => get().markets.includes(market),
    }),
    { name: 'bitmoa-favorites' }
  )
)
