// // src/lib/store.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// // ✅ CORRECT - Named export
// export const usePricingStore = create((set, get) => ({
//   // Pricing data
//   pricingOffers: [],
//   selectedOffer: null,
//   loading: false,
//   error: null,

//   // Actions
//   setPricingOffers: (offers) =>
//     set({
//       pricingOffers: offers,
//       loading: false,
//       error: null,
//     }),

//   setSelectedOffer: (offer) => set({ selectedOffer: offer }),

//   setLoading: (loading) => set({ loading }),

//   setError: (error) => set({ error, loading: false }),

//   // Clear data
//   clearPricingData: () =>
//     set({
//       pricingOffers: [],
//       selectedOffer: null,
//       loading: false,
//       error: null,
//     }),

//   // Get normalized offer data
//   getNormalizedOffer: (offerId) => {
//     const { pricingOffers } = get();
//     return pricingOffers.find(
//       (offer) =>
//         offer.pricedOffer?.id === offerId ||
//         offer.id === offerId ||
//         offer.offer_id === offerId
//     );
//   },
// }));

// export const useBookingStore = create(
//   persist(
//     (set, get) => ({
//       selectedOffer: null,
//       pricedOffer: null,
//       bookingState: "selection",
//       selectedServices: [],
//       selectedSeats: {},
//       passengerDetails: [],

//       setSelectedOffer: (offer) =>
//         set({ selectedOffer: offer, bookingState: "pricing" }),

//       setPricedOffer: (offer) => set({ pricedOffer: offer }),

//       setBookingState: (state) => set({ bookingState: state }),

//       setSelectedServices: (services) => set({ selectedServices: services }),

//       setSelectedSeats: (seats) => set({ selectedSeats: seats }),

//       setPassengerDetails: (passengers) =>
//         set({ passengerDetails: passengers }),

//       resetBookingFlow: () =>
//         set({
//           selectedOffer: null,
//           pricedOffer: null,
//           bookingState: "selection",
//           selectedServices: [],
//           selectedSeats: {},
//           passengerDetails: [],
//         }),
//     }),
//     {
//       name: "flight-booking-store",
//       partialize: (state) => ({
//         selectedOffer: state.selectedOffer,
//         pricedOffer: state.pricedOffer,
//         bookingState: state.bookingState,
//         selectedServices: state.selectedServices,
//         selectedSeats: state.selectedSeats,
//         passengerDetails: state.passengerDetails,
//       }),
//     }
//   )
// );

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useBookingStore = create(
  persist(
    (set, get) => ({
      // Flight selection
      selectedFlight: null,
      pricedOffer: null,

      // Passenger details
      passengerDetails: [],

      // Additional services
      selectedBaggage: [],
      selectedSeats: [],
      selectedServices: [],

      // Booking flow state
      currentStep: "passengers", // passengers, baggage, seats, payment
      bookingReference: null,

      // Actions
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setPricedOffer: (offer) => set({ pricedOffer: offer }),
      setSelectedOffer: (offer) =>
        set({ pricedOffer: offer, selectedFlight: offer }),

      setPassengerDetails: (passengers) =>
        set({ passengerDetails: passengers }),

      setSelectedBaggage: (baggage) => set({ selectedBaggage: baggage }),
      setSelectedSeats: (seats) => set({ selectedSeats: seats }),
      setSelectedServices: (services) => set({ selectedServices: services }),

      setCurrentStep: (step) => set({ currentStep: step }),
      setBookingReference: (ref) => set({ bookingReference: ref }),

      // Reset booking
      resetBooking: () =>
        set({
          selectedFlight: null,
          pricedOffer: null,
          passengerDetails: [],
          selectedBaggage: [],
          selectedSeats: [],
          selectedServices: [],
          currentStep: "passengers",
          bookingReference: null,
        }),

      // Calculate total price
      calculateTotalPrice: () => {
        const state = get();
        const basePrice = Number.parseFloat(
          state.pricedOffer?.total_amount || 0
        );
        const baggagePrice = state.selectedBaggage.reduce(
          (total, bag) => total + Number.parseFloat(bag.price || 0),
          0
        );
        const seatPrice = state.selectedSeats.reduce(
          (total, seat) => total + Number.parseFloat(seat.price || 0),
          0
        );
        const servicesPrice = state.selectedServices.reduce(
          (total, service) =>
            total +
            Number.parseFloat(service.price || service.total_amount || 0),
          0
        );

        return basePrice + baggagePrice + seatPrice + servicesPrice;
      },
    }),
    {
      name: "booking-storage",
    }
  )
);

export const usePricingStore = create((set, get) => ({
  pricingOffers: [],
  selectedOffer: null,
  loading: false,
  error: null,

  setPricingOffers: (offers) => set({ pricingOffers: offers }),
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getNormalizedOffer: (offerId) => {
    const { pricingOffers } = get();
    return pricingOffers.find(
      (offer) =>
        offer.pricedOffer?.id === offerId ||
        offer.id === offerId ||
        offer.offer_id === offerId
    );
  },

  getOfferPrice: (offer) => {
    if (!offer) return { amount: 0, currency: "USD" };

    // Handle Amadeus format
    if (offer.total_amount && offer.total_currency) {
      return {
        amount: Number.parseFloat(offer.total_amount),
        currency: offer.total_currency,
      };
    }

    // Handle Duffel format
    if (offer.total_amount) {
      return {
        amount: Number.parseFloat(offer.total_amount),
        currency: offer.total_currency || "USD",
      };
    }

    // Handle other formats
    if (offer.price) {
      return {
        amount: Number.parseFloat(offer.price.amount || offer.price),
        currency: offer.price.currency || "USD",
      };
    }

    return { amount: 0, currency: "USD" };
  },
}));
