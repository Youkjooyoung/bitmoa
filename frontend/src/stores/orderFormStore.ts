import { create } from 'zustand'

interface OrderFormState {
  presetPrice: number | null
  presetNonce: number
  setPresetPrice: (price: number) => void
  clearPresetPrice: () => void
}

export const useOrderFormStore = create<OrderFormState>((set) => ({
  presetPrice: null,
  presetNonce: 0,
  setPresetPrice: (price) => {
    set((state) => ({ presetPrice: price, presetNonce: state.presetNonce + 1 }))
  },
  clearPresetPrice: () => {
    set({ presetPrice: null })
  },
}))
