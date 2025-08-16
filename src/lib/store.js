// src/lib/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ✅ CORRECT - Named export
export const usePricingStore = create((set, get) => ({
  // Pricing data
  pricingOffers: [],
  selectedOffer: null,
  loading: false,
  error: null,

  // Actions
  setPricingOffers: (offers) =>
    set({
      pricingOffers: offers,
      loading: false,
      error: null,
    }),

  setSelectedOffer: (offer) => set({ selectedOffer: offer }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  // Clear data
  clearPricingData: () =>
    set({
      pricingOffers: [],
      selectedOffer: null,
      loading: false,
      error: null,
    }),

  // Get normalized offer data
  getNormalizedOffer: (offerId) => {
    const { pricingOffers } = get();
    return pricingOffers.find(
      (offer) =>
        offer.pricedOffer?.id === offerId ||
        offer.id === offerId ||
        offer.offer_id === offerId
    );
  },
}));

export const useBookingStore = create(
  persist(
    (set, get) => ({
      selectedOffer: null,
      pricedOffer: null,
      bookingState: "selection",
      selectedServices: [],
      selectedSeats: {},
      passengerDetails: [],

      setSelectedOffer: (offer) =>
        set({ selectedOffer: offer, bookingState: "pricing" }),

      setPricedOffer: (offer) => set({ pricedOffer: offer }),

      setBookingState: (state) => set({ bookingState: state }),

      setSelectedServices: (services) => set({ selectedServices: services }),

      setSelectedSeats: (seats) => set({ selectedSeats: seats }),

      setPassengerDetails: (passengers) =>
        set({ passengerDetails: passengers }),

      resetBookingFlow: () =>
        set({
          selectedOffer: null,
          pricedOffer: null,
          bookingState: "selection",
          selectedServices: [],
          selectedSeats: {},
          passengerDetails: [],
        }),
    }),
    {
      name: "flight-booking-store",
      partialize: (state) => ({
        selectedOffer: state.selectedOffer,
        pricedOffer: state.pricedOffer,
        bookingState: state.bookingState,
        selectedServices: state.selectedServices,
        selectedSeats: state.selectedSeats,
        passengerDetails: state.passengerDetails,
      }),
    }
  )
);
