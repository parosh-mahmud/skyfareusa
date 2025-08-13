// src/lib/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Optional: for saving state

export const useBookingStore = create(
  // The persist middleware can save the booking flow state to localStorage.
  // This allows a user to refresh the page and not lose their selected flight.
  persist(
    (set) => ({
      // State for the entire booking flow
      selectedOffer: null, // The initial offer selected from the search results
      pricedOffer: null, // The offer after re-pricing (has the final price and new ID)
      bookingState: "idle", // Tracks the current stage: idle, pricing, priced, payment, confirmed

      // --- Actions ---

      /**
       * Kicks off the booking flow by storing the user's chosen flight.
       * This should be called when the user clicks "Select" on a fare.
       */
      selectOfferForBooking: (offer) =>
        set({
          selectedOffer: offer,
          pricedOffer: null, // Clear any previous priced offer
          bookingState: "pricing", // Move to the 'pricing' stage
        }),

      /**
       * Updates the store with the confirmed, re-priced offer from your API.
       */
      setPricedOffer: (offer) =>
        set({
          pricedOffer: offer,
          bookingState: "priced", // Move to the 'priced' stage (ready for passenger details)
        }),

      /**
       * Resets the entire booking flow.
       * Call this after a successful booking or if the user cancels.
       */
      resetBookingFlow: () =>
        set({
          selectedOffer: null,
          pricedOffer: null,
          bookingState: "idle",
        }),
    }),
    {
      name: "flight-booking-storage", // Name for the localStorage item
    }
  )
);
