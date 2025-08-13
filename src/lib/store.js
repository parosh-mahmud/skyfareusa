// src/lib/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
