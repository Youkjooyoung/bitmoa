import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Ticker } from '@/types'

interface TickerState {
  tickers: Record<string, Ticker>
  applyDelta: (tickers: Ticker[]) => void
  replaceAll: (tickers: Ticker[]) => void
  getTicker: (market: string) => Ticker | undefined
}

export const useTickerStore = create<TickerState>()(
  subscribeWithSelector((set, get) => ({
    tickers: {},

    applyDelta: (delta) => {
      if (!delta || delta.length === 0) return
      set((state) => {
        const next = { ...state.tickers }
        for (const ticker of delta) {
          next[ticker.market] = ticker
        }
        return { tickers: next }
      })
    },

    replaceAll: (tickers) => {
      const map: Record<string, Ticker> = {}
      for (const ticker of tickers) {
        map[ticker.market] = ticker
      }
      set({ tickers: map })
    },

    getTicker: (market) => get().tickers[market],
  }))
)
