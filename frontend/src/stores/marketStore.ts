import { create } from 'zustand'

interface MarketState {
  selectedMarket: string
  setSelectedMarket: (market: string) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedMarket: 'KRW-BTC',

  setSelectedMarket: (market) => {
    set({ selectedMarket: market })
  },
}))
