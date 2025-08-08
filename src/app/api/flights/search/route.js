// // src/app/api/flights/search/route.js
// import { Duffel } from "@duffel/api";
// import { NextResponse } from "next/server";

// // Initialize the Duffel client
// const duffel = new Duffel({
//   token: process.env.DUFFEL_ACCESS_TOKEN,
// });

// export async function POST(request) {
//   try {
//     const { slices, passengers, cabin_class } = await request.json();

//     if (!slices || !Array.isArray(slices) || slices.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "The 'slices' array is required." },
//         { status: 400 }
//       );
//     }

//     // Using .create() as shown in the library documentation
//     const offerRequest = await duffel.offerRequests.create({
//       slices,
//       passengers,
//       cabin_class: cabin_class || "economy",
//       return_offers: true,
//     });

//     console.log(`✅ Offer Request successful: ${offerRequest.data.id}`);

//     return NextResponse.json({
//       success: true,
//       offer_request_id: offerRequest.data.id,
//       offers: offerRequest.data.offers,
//       meta: {
//         // The meta object for pagination is not returned on create
//         // but we can construct a partial one for the client.
//         limit: offerRequest.data.offers.length,
//         after: null, // The first response has no 'after' cursor
//       },
//     });
//   } catch (error) {
//     //
//     // --- IMPROVEMENT BASED ON DOCUMENTATION ---
//     //
//     // The library throws a detailed error object. We now log the request_id
//     // from `error.meta` and the structured errors from `error.errors`.
//     //
//     console.error("❌ Duffel API Error on Search:", {
//       requestId: error.meta?.request_id,
//       statusCode: error.meta?.status,
//       errors: error.errors,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to search for flights.",
//         // Pass the structured error details back to the client
//         details: error.errors || [
//           { message: "An unknown server error occurred." },
//         ],
//       },
//       { status: error.meta?.status || 500 }
//     );
//   }
// }

// // src/app/api/flights/search/route.js

// import { Duffel } from "@duffel/api";
// import Amadeus from "amadeus";
// import { NextResponse } from "next/server";

// // --- 1. INITIALIZE API CLIENTS ---
// const duffel = new Duffel({
//   token: process.env.DUFFEL_ACCESS_TOKEN,
// });

// const amadeus = new Amadeus({
//   clientId: process.env.AMADEUS_API_KEY,
//   clientSecret: process.env.AMADEUS_API_SECRET,
// });

// // --- 2. ADAPTER, NORMALIZATION, AND DEDUPLICATION FUNCTIONS ---

// function createDuffelPayload(unifiedRequest) {
//   return {
//     slices: unifiedRequest.slices.map((slice) => ({
//       origin: slice.origin, // Pass IATA code as a string
//       destination: slice.destination, // Pass IATA code as a string
//       departure_date: slice.departure_date,
//     })),
//     passengers: unifiedRequest.passengers,
//     cabin_class: unifiedRequest.cabin_class,
//   };
// }

// /**
//  * [COMPLETE IMPLEMENTATION] This function was missing in your last attempt.
//  * It creates a detailed Amadeus request payload from our simple unified request.
//  */
// function createAmadeusPayload(unifiedRequest) {
//   const { slices, passengers, cabin_class, excluded_carriers } = unifiedRequest;

//   const payload = {
//     currencyCode: "USD",
//     originDestinations: slices.map((slice, index) => ({
//       id: (index + 1).toString(),
//       originLocationCode: slice.origin,
//       destinationLocationCode: slice.destination,
//       departureDateTimeRange: { date: slice.departure_date },
//     })),
//     travelers: passengers.map((p, index) => ({
//       id: (index + 1).toString(),
//       travelerType: p.type.toUpperCase(),
//     })),
//     sources: ["GDS"],
//     searchCriteria: {
//       maxFlightOffers: 50,
//       flightFilters: {
//         cabinRestrictions: [
//           {
//             cabin: cabin_class?.toUpperCase() || "ECONOMY",
//             coverage: "MOST_SEGMENTS",
//             originDestinationIds: slices.map((_, index) =>
//               (index + 1).toString()
//             ),
//           },
//         ],
//       },
//     },
//   };

//   if (excluded_carriers && excluded_carriers.length > 0) {
//     payload.searchCriteria.flightFilters.carrierRestrictions = {
//       excludedCarrierCodes: excluded_carriers,
//     };
//   }

//   return payload; // This return statement is crucial
// }

// const normalizeDuffelOffer = (duffelOffer) => ({
//   id: duffelOffer.id,
//   sourceApi: "duffel",
//   total_amount: duffelOffer.total_amount,
//   total_currency: duffelOffer.total_currency,
//   slices:
//     duffelOffer.slices?.map((slice) => ({
//       duration: slice.duration,
//       origin: slice.origin,
//       destination: slice.destination,
//       segments:
//         slice.segments?.map((seg) => ({
//           departing_at: seg.departing_at,
//           arriving_at: seg.arriving_at,
//           carrier: seg.marketing_carrier,
//           flight_number: seg.marketing_carrier_flight_number,
//         })) ?? [],
//     })) ?? [],
// });

// const normalizeAmadeusOffer = (amadeusOffer, dictionaries) => ({
//   id: amadeusOffer.id,
//   sourceApi: "amadeus",
//   total_amount: amadeusOffer.price?.total,
//   total_currency: amadeusOffer.price?.currency,
//   slices:
//     amadeusOffer.itineraries?.map((itinerary) => ({
//       duration: itinerary.duration,
//       segments:
//         itinerary.segments?.map((seg) => ({
//           departing_at: seg.departure.at,
//           arriving_at: seg.arrival.at,
//           origin: { iata_code: seg.departure.iataCode },
//           destination: { iata_code: seg.arrival.iataCode },
//           carrier: {
//             iata_code: seg.carrierCode,
//             name: dictionaries.carriers[seg.carrierCode],
//           },
//           flight_number: seg.number,
//         })) ?? [],
//     })) ?? [],
// });

// const getItineraryKey = (normalizedOffer) => {
//   return (
//     normalizedOffer.slices
//       ?.map((slice) =>
//         slice.segments
//           ?.map(
//             (seg) =>
//               `${seg.carrier?.iata_code}${seg.flight_number}-${seg.origin?.iata_code}-${seg.destination?.iata_code}`
//           )
//           .join("_")
//       )
//       .join("__") ?? `fallback_${Math.random()}`
//   );
// };

// // --- 3. THE MAIN API ROUTE HANDLER ---
// export async function POST(request) {
//   try {
//     const unifiedRequest = await request.json();

//     if (!unifiedRequest.slices || unifiedRequest.slices.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "The 'slices' array is required." },
//         { status: 400 }
//       );
//     }

//     const duffelPayload = createDuffelPayload(unifiedRequest);
//     const amadeusPayload = createAmadeusPayload(unifiedRequest); // This will now return a valid object

//     // A helpful debugging check
//     if (!duffelPayload || !amadeusPayload) {
//       console.error("A payload is undefined!", {
//         duffelPayload,
//         amadeusPayload,
//       });
//       return NextResponse.json(
//         { error: "Internal error: Failed to create API request payload." },
//         { status: 500 }
//       );
//     }

//     console.log(
//       "✈️ Adapted Amadeus Payload:",
//       JSON.stringify(amadeusPayload, null, 2)
//     );
//     console.log(
//       "✈️ Adapted Duffel Payload:",
//       JSON.stringify(duffelPayload, null, 2)
//     );

//     const duffelPromise = duffel.offerRequests.create(duffelPayload);
//     const amadeusPromise =
//       amadeus.shopping.flightOffersSearch.post(amadeusPayload);

//     const results = await Promise.allSettled([duffelPromise, amadeusPromise]);

//     let allOffers = [];
//     const apiErrors = [];

//     const [duffelResult, amadeusResult] = results;

//     if (duffelResult.status === "fulfilled") {
//       const normalized =
//         duffelResult.value.data.offers.map(normalizeDuffelOffer);
//       allOffers.push(...normalized);
//     } else {
//       apiErrors.push({ source: "duffel", error: duffelResult.reason.errors });
//     }

//     if (amadeusResult.status === "fulfilled") {
//       const { data, dictionaries } = amadeusResult.value.result;
//       const normalized = data.map((offer) =>
//         normalizeAmadeusOffer(offer, dictionaries)
//       );
//       allOffers.push(...normalized);
//     } else {
//       apiErrors.push({
//         source: "amadeus",
//         error: amadeusResult.reason.description,
//       });
//     }

//     const uniqueOffers = new Map();
//     allOffers.forEach((offer) => {
//       const key = getItineraryKey(offer);
//       const existingOffer = uniqueOffers.get(key);

//       if (
//         !existingOffer ||
//         parseFloat(offer.total_amount) < parseFloat(existingOffer.total_amount)
//       ) {
//         uniqueOffers.set(key, offer);
//       }
//     });

//     const finalOffers = Array.from(uniqueOffers.values());
//     finalOffers.sort(
//       (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
//     );

//     return NextResponse.json({
//       success: true,
//       offers: finalOffers,
//       meta: { api_errors: apiErrors },
//     });
//   } catch (error) {
//     console.error("❌ Unhandled Server Error in flight search:", error);
//     return NextResponse.json(
//       { success: false, error: "An unexpected server error occurred." },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/flights/search/route.js

import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// --- 1. INITIALIZE API CLIENTS ---
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

// --- 2. ADAPTERS & NORMALIZATION ---

function createDuffelPayload(unifiedRequest) {
  return {
    slices: unifiedRequest.slices.map((slice) => ({
      origin: slice.origin,
      destination: slice.destination,
      departure_date: slice.departure_date,
    })),
    passengers: unifiedRequest.passengers,
    cabin_class: unifiedRequest.cabin_class,
  };
}

function createAmadeusPayload(unifiedRequest) {
  const { slices, passengers, cabin_class } = unifiedRequest;
  return {
    currencyCode: "USD",
    originDestinations: slices.map((slice, index) => ({
      id: (index + 1).toString(),
      originLocationCode: slice.origin,
      destinationLocationCode: slice.destination,
      departureDateTimeRange: { date: slice.departure_date },
    })),
    travelers: passengers.map((p, index) => ({
      id: (index + 1).toString(),
      travelerType: p.type.toUpperCase(),
    })),
    sources: ["GDS"],
    searchCriteria: {
      maxFlightOffers: 50,
      flightFilters: {
        cabinRestrictions: [
          {
            cabin: cabin_class?.toUpperCase() || "ECONOMY",
            coverage: "MOST_SEGMENTS",
            originDestinationIds: slices.map((_, i) => (i + 1).toString()),
          },
        ],
      },
    },
  };
}

/**
 * ✅ PERFECTED NORMALIZATION
 * This ensures every piece of data needed for the UI is extracted consistently.
 */
const normalizeDuffelOffer = (offer) => ({
  id: offer.id,
  sourceApi: "duffel",
  total_amount: offer.total_amount,
  total_currency: offer.total_currency,
  slices: offer.slices.map((slice) => ({
    duration: slice.duration,
    origin: slice.origin,
    destination: slice.destination,
    segments: slice.segments.map((seg) => ({
      origin: seg.origin,
      destination: seg.destination,
      departing_at: seg.departing_at,
      arriving_at: seg.arriving_at,
      carrier: seg.marketing_carrier,
      flight_number: seg.marketing_carrier_flight_number,
      duration: seg.duration,
      aircraft: seg.aircraft,
    })),
  })),
  passengers: offer.passengers,
  conditions: offer.conditions,
});

const normalizeAmadeusOffer = (offer, dictionaries) => ({
  id: offer.id,
  sourceApi: "amadeus",
  total_amount: offer.price.total,
  total_currency: offer.price.currency,
  slices: offer.itineraries.map((itinerary) => ({
    duration: itinerary.duration,
    segments: itinerary.segments.map((seg) => ({
      origin: {
        iata_code: seg.departure.iataCode,
        name: dictionaries.locations[seg.departure.iataCode]?.cityCode,
        airportName: dictionaries.locations[seg.departure.iataCode]?.name,
      },
      destination: {
        iata_code: seg.arrival.iataCode,
        name: dictionaries.locations[seg.arrival.iataCode]?.cityCode,
        airportName: dictionaries.locations[seg.arrival.iataCode]?.name,
      },
      departing_at: seg.departure.at,
      arriving_at: seg.arrival.at,
      carrier: {
        iata_code: seg.carrierCode,
        name: dictionaries.carriers[seg.carrierCode],
      },
      flight_number: seg.number,
      duration: seg.duration,
      aircraft: { name: dictionaries.aircraft[seg.aircraft.code] },
    })),
  })),
  passengers: offer.travelerPricings.map((p) => ({
    id: p.travelerId,
    type: p.travelerType.toLowerCase(),
  })),
  conditions: {
    // Amadeus does not provide simple refund/change conditions in the search response
    refund_before_departure: null,
    change_before_departure: null,
  },
});

/**
 * ✅ ROBUST DEDUPLICATION KEY
 * This key is now safer and handles potential missing data gracefully.
 */
const getItineraryKey = (offer) => {
  return offer.slices
    .map((slice) =>
      slice.segments
        .map(
          (seg) =>
            `${seg.carrier?.iata_code || "XX"}${seg.flight_number}-${
              seg.origin?.iata_code
            }-${seg.destination?.iata_code}`
        )
        .join("_")
    )
    .join("__");
};

// --- 3. THE MAIN API ROUTE HANDLER ---
export async function POST(request) {
  try {
    const unifiedRequest = await request.json();
    if (!unifiedRequest.slices || unifiedRequest.slices.length === 0) {
      return NextResponse.json(
        { success: false, error: "Slices are required." },
        { status: 400 }
      );
    }

    const duffelPayload = createDuffelPayload(unifiedRequest);
    const amadeusPayload = createAmadeusPayload(unifiedRequest);

    const duffelPromise = duffel.offerRequests.create(duffelPayload);
    const amadeusPromise =
      amadeus.shopping.flightOffersSearch.post(amadeusPayload);

    const results = await Promise.allSettled([duffelPromise, amadeusPromise]);
    let allOffers = [];
    const apiErrors = [];

    const [duffelResult, amadeusResult] = results;

    if (duffelResult.status === "fulfilled") {
      allOffers.push(
        ...duffelResult.value.data.offers.map(normalizeDuffelOffer)
      );
    } else {
      apiErrors.push({ source: "duffel", error: duffelResult.reason.errors });
    }

    if (amadeusResult.status === "fulfilled") {
      const { data, dictionaries } = amadeusResult.value.result;
      allOffers.push(
        ...data.map((offer) => normalizeAmadeusOffer(offer, dictionaries))
      );
    } else {
      apiErrors.push({
        source: "amadeus",
        error: amadeusResult.reason.description,
      });
    }

    // ✅ DEDUPLICATION: Keep only the cheapest offer for each unique itinerary
    const uniqueOffers = new Map();
    allOffers.forEach((offer) => {
      const key = getItineraryKey(offer);
      const existing = uniqueOffers.get(key);
      if (
        !existing ||
        parseFloat(offer.total_amount) < parseFloat(existing.total_amount)
      ) {
        uniqueOffers.set(key, offer);
      }
    });

    const finalOffers = Array.from(uniqueOffers.values());

    // ✅ SORTING: Sort the final list by price, cheapest first.
    finalOffers.sort(
      (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
    );

    return NextResponse.json({
      success: true,
      offers: finalOffers,
      meta: { api_errors: apiErrors },
    });
  } catch (error) {
    console.error("❌ Unhandled Server Error in flight search:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
