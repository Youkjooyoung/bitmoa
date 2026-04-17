import { create } from 'zustand'
import type { Ticker } from '@/types'

interface TickerState {
  tickers: Record<string, Ticker>
  version: number
  updateTicker: (ticker: Ticker) => void
  updateTickers: (tickers: Ticker[]) => void
  getTicker: (market: string) => Ticker | undefined
}

export const useTickerStore = create<TickerState>((set, get) => ({
  tickers: {},
  version: 0,

  updateTicker: (ticker) => {
    set((state) => ({
      tickers: { ...state.tickers, [ticker.market]: ticker },
      version: state.version + 1,
    }))
  },

  updateTickers: (tickers) => {
    set((state) => {
      const newTickers = { ...state.tickers }
      tickers.forEach((ticker) => {
        newTickers[ticker.market] = ticker
      })
      return { tickers: newTickers, version: state.version + 1 }
    })
  },

  getTicker: (market) => {
    return get().tickers[market]
  },
}))
