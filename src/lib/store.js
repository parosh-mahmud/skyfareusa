// src/lib/store.js (or a new /store directory)
import { create } from "zustand";

export const useAppStore = create((set) => ({
  currency: "USD",
  setCurrency: (newCurrency) => set({ currency: newCurrency }),

  shortlist: [],
  addToShortlist: (flight) =>
    set((state) => ({ shortlist: [...state.shortlist, flight] })),
}));

// In any component:
import { useAppStore } from "@/lib/store";

function CurrencySelector() {
  const { currency, setCurrency } = useAppStore();
  // ...
}

function AddToShortlistButton({ flight }) {
  const addToShortlist = useAppStore((state) => state.addToShortlist);
  return (
    <button onClick={() => addToShortlist(flight)}>Add to Shortlist</button>
  );
}
