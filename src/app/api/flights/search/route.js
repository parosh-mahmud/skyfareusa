// import { Duffel } from "@duffel/api";
// import Amadeus from "amadeus";
// import { NextResponse } from "next/server";

// // --- 1. INITIALIZE API CLIENTS ---
// const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
// const amadeus = new Amadeus({
//   clientId: process.env.AMADEUS_API_KEY,
//   clientSecret: process.env.AMADEUS_API_SECRET,
// });

// // --- 2. ADAPTERS, NORMALIZATION, DEDUPLICATION ---

// // Handles both simple strings (from Postman) and objects (from frontend)
// const getIataCode = (location) =>
//   typeof location === "object" ? location.code : location;

// function createDuffelPayload(req) {
//   return {
//     slices: req.slices.map((s) => ({
//       origin: getIataCode(s.origin),
//       destination: getIataCode(s.destination),
//       departure_date: s.departure_date,
//     })),
//     passengers: req.passengers,
//     cabin_class: req.cabin_class,
//   };
// }

// function createAmadeusPayload(req) {
//   return {
//     currencyCode: "USD",
//     originDestinations: req.slices.map((s, i) => ({
//       id: (i + 1).toString(),
//       originLocationCode: getIataCode(s.origin),
//       destinationLocationCode: getIataCode(s.destination),
//       departureDateTimeRange: { date: s.departure_date },
//     })),
//     travelers: req.passengers.map((p, i) => ({
//       id: (i + 1).toString(),
//       travelerType: p.type.toUpperCase(),
//     })),
//     sources: ["GDS"],
//     searchCriteria: { maxFlightOffers: 50 },
//   };
// }

// // --- NORMALIZERS (Perfected for full data extraction) ---

// const normalizeDuffelOffer = (offer) => ({
//   id: offer.id,
//   sourceApi: "duffel",
//   total_amount: offer.total_amount,
//   total_currency: offer.total_currency,
//   slices: offer.slices.map((slice) => ({
//     duration: slice.duration,
//     origin: {
//       city_name: slice.origin.city_name,
//       airportName: slice.origin.name,
//       iata_code: slice.origin.iata_code,
//     },
//     destination: {
//       city_name: slice.destination.city_name,
//       airportName: slice.destination.name,
//       iata_code: slice.destination.iata_code,
//     },
//     segments: slice.segments.map((seg) => ({
//       origin: seg.origin,
//       destination: seg.destination,
//       departing_at: seg.departing_at,
//       arriving_at: seg.arriving_at,
//       carrier: seg.marketing_carrier,
//       flight_number: seg.marketing_carrier_flight_number,
//       duration: seg.duration,
//       aircraft: seg.aircraft,
//     })),
//   })),
//   passengers: offer.passengers,
//   conditions: offer.conditions,
// });

// const normalizeAmadeusOffer = (offer, dictionaries) => ({
//   id: offer.id,
//   sourceApi: "amadeus",
//   total_amount: offer.price.total,
//   total_currency: offer.price.currency,
//   slices: offer.itineraries.map((itinerary) => ({
//     duration: itinerary.duration,
//     segments: itinerary.segments.map((seg) => {
//       const departureLoc = dictionaries.locations[seg.departure.iataCode] || {};
//       const arrivalLoc = dictionaries.locations[seg.arrival.iataCode] || {};
//       return {
//         origin: {
//           iata_code: seg.departure.iataCode,
//           city_name: departureLoc.cityCode,
//           airportName:
//             departureLoc.subType === "AIRPORT" ? seg.departure.iataCode : "",
//         },
//         destination: {
//           iata_code: seg.arrival.iataCode,
//           city_name: arrivalLoc.cityCode,
//           airportName:
//             arrivalLoc.subType === "AIRPORT" ? seg.arrival.iataCode : "",
//         },
//         departing_at: seg.departure.at,
//         arriving_at: seg.arrival.at,
//         carrier: {
//           iata_code: seg.carrierCode,
//           name: dictionaries.carriers[seg.carrierCode],
//         },
//         flight_number: seg.number,
//         duration: seg.duration,
//         aircraft: { name: dictionaries.aircraft[seg.aircraft.code] },
//       };
//     }),
//   })),
//   passengers: offer.travelerPricings.map((p) => {
//     const checkedBags = p.fareDetailsBySegment.reduce(
//       (acc, detail) => acc + (detail.includedCheckedBags?.quantity || 0),
//       0
//     );
//     return {
//       id: p.travelerId,
//       type: p.travelerType.toLowerCase(),
//       baggages: [
//         { type: "carry_on", quantity: 1 }, // Assume 1 carry-on as default
//         ...(checkedBags > 0
//           ? [{ type: "checked", quantity: checkedBags }]
//           : []),
//       ],
//     };
//   }),
//   conditions: {}, // Not available in Amadeus search response
//   rawOffer: offer,
// });

// const getItineraryKey = (offer) => {
//   return offer.slices
//     .map((slice) =>
//       slice.segments
//         .map(
//           (seg) =>
//             `${seg.carrier?.iata_code}${seg.flight_number}-${seg.origin?.iata_code}`
//         )
//         .join("_")
//     )
//     .join("__");
// };

// // --- 3. MAIN API ROUTE HANDLER ---
// export async function POST(request) {
//   try {
//     const unifiedRequest = await request.json();
//     if (!unifiedRequest.slices?.length) {
//       return NextResponse.json(
//         { success: false, error: "Slices are required." },
//         { status: 400 }
//       );
//     }

//     const page = unifiedRequest.page || 1;
//     const limit = 20; // Results per page

//     let allOffers = [];
//     const apiErrors = [];

//     // Only fetch from APIs on the first page to build the full result set
//     if (page === 1) {
//       const duffelPayload = createDuffelPayload(unifiedRequest);
//       const amadeusPayload = createAmadeusPayload(unifiedRequest);

//       const duffelPromise = duffel.offerRequests.create({
//         ...duffelPayload,
//         max_connections: 1,
//         return_offers: true,
//       });
//       const amadeusPromise =
//         amadeus.shopping.flightOffersSearch.post(amadeusPayload);
//       const results = await Promise.allSettled([duffelPromise, amadeusPromise]);
//       const [duffelResult, amadeusResult] = results;

//       if (duffelResult.status === "fulfilled") {
//         allOffers.push(
//           ...duffelResult.value.data.offers.map(normalizeDuffelOffer)
//         );
//       } else {
//         apiErrors.push({ source: "duffel", error: duffelResult.reason.errors });
//       }

//       if (amadeusResult.status === "fulfilled") {
//         const { data, dictionaries } = amadeusResult.value.result;
//         allOffers.push(
//           ...data.map((offer) => normalizeAmadeusOffer(offer, dictionaries))
//         );
//       } else {
//         apiErrors.push({
//           source: "amadeus",
//           error: amadeusResult.reason.description,
//         });
//       }
//     }

//     // This section can be improved with a cache (like Redis) to store `allOffers`
//     // For now, we only support loading the first page.
//     const uniqueOffers = new Map();
//     allOffers.forEach((offer) => {
//       const key = getItineraryKey(offer);
//       const existing = uniqueOffers.get(key);
//       if (
//         !existing ||
//         parseFloat(offer.total_amount) < parseFloat(existing.total_amount)
//       ) {
//         uniqueOffers.set(key, offer);
//       }
//     });

//     const finalOffers = Array.from(uniqueOffers.values());
//     finalOffers.sort(
//       (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
//     );

//     const paginatedOffers = finalOffers.slice((page - 1) * limit, page * limit);

//     return NextResponse.json({
//       success: true,
//       offers: paginatedOffers,
//       meta: {
//         api_errors: apiErrors,
//         currentPage: page,
//         hasNextPage: finalOffers.length > page * limit,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Unhandled Server Error:", error);
//     return NextResponse.json(
//       { success: false, error: "An unexpected server error occurred." },
//       { status: 500 }
//     );
//   }
// }

// import { Duffel } from "@duffel/api";
// import Amadeus from "amadeus";
// import { NextResponse } from "next/server";

// // --- 1. INITIALIZE API CLIENTS ---
// const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
// const amadeus = new Amadeus({
//   hostname: "production",
//   clientId: process.env.AMADEUS_API_KEY,
//   clientSecret: process.env.AMADEUS_API_SECRET,
// });

// // --- 2. ADAPTERS, NORMALIZATION, DEDUPLICATION ---

// // Handles both simple strings (from Postman) and objects (from frontend)
// const getIataCode = (location) =>
//   typeof location === "object" ? location.code : location;

// function createDuffelPayload(req) {
//   return {
//     slices: req.slices.map((s) => ({
//       origin: getIataCode(s.origin),
//       destination: getIataCode(s.destination),
//       departure_date: s.departure_date,
//     })),
//     // Corrected logic for Duffel passengers
//     passengers: req.passengers.map((p) => {
//       // If age is present, send only age. Otherwise, send only type.
//       if (p.age) {
//         return { age: p.age };
//       }
//       return { type: p.type };
//     }),
//     cabin_class: req.cabin_class,
//   };
// }

// function createAmadeusPayload(req) {
//   // CORRECTED: Added a mapping for infant types
//   const mapPassengerType = (type) => {
//     switch (type) {
//       case "adult":
//         return "ADULT";
//       case "child":
//         return "CHILD";
//       case "infant_without_seat":
//         return "HELD_INFANT";
//       default:
//         return type.toUpperCase();
//     }
//   };

//   // Find the first adult passenger ID to associate with the infant
//   const firstAdultId =
//     req.passengers.find((p) => p.type === "adult")?.id || "1";

//   return {
//     currencyCode: "USD",
//     originDestinations: req.slices.map((s, i) => ({
//       id: (i + 1).toString(),
//       originLocationCode: getIataCode(s.origin),
//       destinationLocationCode: getIataCode(s.destination),
//       departureDateTimeRange: { date: s.departure_date },
//     })),
//     travelers: req.passengers.map((p, i) => {
//       const travelerId = (i + 1).toString();
//       const travelerType = mapPassengerType(p.type);

//       // Amadeus requires associatedAdultId for HELD_INFANT
//       if (travelerType === "HELD_INFANT") {
//         return {
//           id: travelerId,
//           travelerType,
//           associatedAdultId: firstAdultId,
//         };
//       }
//       return {
//         id: travelerId,
//         travelerType,
//       };
//     }),
//     sources: ["GDS"],
//     searchCriteria: { maxFlightOffers: 50 },
//   };
// }

// // --- NORMALIZERS (Perfected for full data extraction) ---

// const normalizeDuffelOffer = (offer) => ({
//   id: offer.id,
//   sourceApi: "duffel",
//   total_amount: offer.total_amount,
//   total_currency: offer.total_currency,
//   slices: offer.slices.map((slice) => ({
//     duration: slice.duration,
//     origin: {
//       city_name: slice.origin.city_name,
//       airportName: slice.origin.name,
//       iata_code: slice.origin.iata_code,
//     },
//     destination: {
//       city_name: slice.destination.city_name,
//       airportName: slice.destination.name,
//       iata_code: slice.destination.iata_code,
//     },
//     segments: slice.segments.map((seg) => ({
//       origin: seg.origin,
//       destination: seg.destination,
//       departing_at: seg.departing_at,
//       arriving_at: seg.arriving_at,
//       carrier: seg.marketing_carrier,
//       flight_number: seg.marketing_carrier_flight_number,
//       duration: seg.duration,
//       aircraft: seg.aircraft,
//     })),
//   })),
//   passengers: offer.passengers,
//   conditions: offer.conditions,
// });

// const normalizeAmadeusOffer = (offer, dictionaries) => ({
//   id: offer.id,
//   sourceApi: "amadeus",
//   total_amount: offer.price.total,
//   total_currency: offer.price.currency,
//   slices: offer.itineraries.map((itinerary) => ({
//     duration: itinerary.duration,
//     segments: itinerary.segments.map((seg) => {
//       const departureLoc = dictionaries.locations[seg.departure.iataCode] || {};
//       const arrivalLoc = dictionaries.locations[seg.arrival.iataCode] || {};
//       return {
//         origin: {
//           iata_code: seg.departure.iataCode,
//           city_name: departureLoc.cityCode,
//           airportName:
//             departureLoc.subType === "AIRPORT" ? seg.departure.iataCode : "",
//         },
//         destination: {
//           iata_code: seg.arrival.iataCode,
//           city_name: arrivalLoc.cityCode,
//           airportName:
//             arrivalLoc.subType === "AIRPORT" ? seg.arrival.iataCode : "",
//         },
//         departing_at: seg.departure.at,
//         arriving_at: seg.arrival.at,
//         carrier: {
//           iata_code: seg.carrierCode,
//           name: dictionaries.carriers[seg.carrierCode],
//         },
//         flight_number: seg.number,
//         duration: seg.duration,
//         aircraft: { name: dictionaries.aircraft[seg.aircraft.code] },
//       };
//     }),
//   })),
//   passengers: offer.travelerPricings.map((p) => {
//     const checkedBags = p.fareDetailsBySegment.reduce(
//       (acc, detail) => acc + (detail.includedCheckedBags?.quantity || 0),
//       0
//     );
//     return {
//       id: p.travelerId,
//       type: p.travelerType.toLowerCase(),
//       baggages: [
//         { type: "carry_on", quantity: 1 }, // Assume 1 carry-on as default
//         ...(checkedBags > 0
//           ? [{ type: "checked", quantity: checkedBags }]
//           : []),
//       ],
//     };
//   }),
//   conditions: {}, // Not available in Amadeus search response
//   rawOffer: offer,
// });

// const getItineraryKey = (offer) => {
//   return offer.slices
//     .map((slice) =>
//       slice.segments
//         .map(
//           (seg) =>
//             `${seg.carrier?.iata_code}${seg.flight_number}-${seg.origin?.iata_code}`
//         )
//         .join("_")
//     )
//     .join("__");
// };

// // --- 3. MAIN API ROUTE HANDLER ---
// export async function POST(request) {
//   try {
//     const unifiedRequest = await request.json();
//     if (!unifiedRequest.slices?.length) {
//       return NextResponse.json(
//         { success: false, error: "Slices are required." },
//         { status: 400 }
//       );
//     }

//     const page = unifiedRequest.page || 1;
//     const limit = 20; // Results per page

//     let allOffers = [];
//     const apiErrors = [];

//     // Only fetch from APIs on the first page to build the full result set
//     if (page === 1) {
//       const duffelPayload = createDuffelPayload(unifiedRequest);
//       const amadeusPayload = createAmadeusPayload(unifiedRequest);

//       const duffelPromise = duffel.offerRequests.create({
//         ...duffelPayload,
//         max_connections: 1,
//         return_offers: true,
//       });
//       const amadeusPromise =
//         amadeus.shopping.flightOffersSearch.post(amadeusPayload);
//       const results = await Promise.allSettled([duffelPromise, amadeusPromise]);
//       const [duffelResult, amadeusResult] = results;

//       if (duffelResult.status === "fulfilled") {
//         allOffers.push(
//           ...duffelResult.value.data.offers.map(normalizeDuffelOffer)
//         );
//       } else {
//         apiErrors.push({ source: "duffel", error: duffelResult.reason.errors });
//       }

//       if (amadeusResult.status === "fulfilled") {
//         const { data, dictionaries } = amadeusResult.value.result;
//         allOffers.push(
//           ...data.map((offer) => normalizeAmadeusOffer(offer, dictionaries))
//         );
//       } else {
//         apiErrors.push({
//           source: "amadeus",
//           error: amadeusResult.reason.description,
//         });
//       }
//     }

//     const uniqueOffers = new Map();
//     allOffers.forEach((offer) => {
//       const key = getItineraryKey(offer);
//       const existing = uniqueOffers.get(key);
//       if (
//         !existing ||
//         parseFloat(offer.total_amount) < parseFloat(existing.total_amount)
//       ) {
//         uniqueOffers.set(key, offer);
//       }
//     });

//     const finalOffers = Array.from(uniqueOffers.values());
//     finalOffers.sort(
//       (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
//     );

//     const paginatedOffers = finalOffers.slice((page - 1) * limit, page * limit);

//     return NextResponse.json({
//       success: true,
//       offers: paginatedOffers,
//       meta: {
//         api_errors: apiErrors,
//         currentPage: page,
//         hasNextPage: finalOffers.length > page * limit,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Unhandled Server Error:", error);
//     return NextResponse.json(
//       { success: false, error: "An unexpected server error occurred." },
//       { status: 500 }
//     );
//   }
// }

import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// --- 1. INITIALIZE API CLIENTS ---
// It's good practice to ensure environment variables are present.
if (
  !process.env.DUFFEL_ACCESS_TOKEN ||
  !process.env.AMADEUS_API_KEY ||
  !process.env.AMADEUS_API_SECRET
) {
  console.error("FATAL: Missing API credentials in environment variables.");
  // In a real app, you might want to throw an error to prevent startup.
}

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
  // **FIXED**: Explicitly set hostname to 'production' to ensure the correct
  // API environment is used, matching your production credentials.
  hostname: "production",
});

// --- 2. ADAPTERS, NORMALIZATION, DEDUPLICATION ---

/**
 * Safely retrieves the IATA code from a location object or string.
 * @param {object|string} location - The location data.
 * @returns {string} The IATA code.
 */
const getIataCode = (location) =>
  typeof location === "object" && location !== null ? location.code : location;

/**
 * Creates the request payload for the Duffel API.
 * @param {object} req - The unified request body from the client.
 * @returns {object} The payload for Duffel's offerRequests.create.
 */
function createDuffelPayload(req) {
  return {
    slices: req.slices.map((s) => ({
      origin: getIataCode(s.origin),
      destination: getIataCode(s.destination),
      departure_date: s.departure_date,
    })),
    // Duffel's API can handle either age or type, but not both for a single passenger.
    // This logic correctly separates them.
    passengers: req.passengers.map((p) =>
      p.age ? { age: p.age } : { type: p.type }
    ),
    cabin_class: req.cabin_class,
  };
}

/**
 * Creates the request payload for the Amadeus API.
 * @param {object} req - The unified request body from the client.
 * @returns {object} The payload for Amadeus's flightOffersSearch.post.
 */
function createAmadeusPayload(req) {
  // Amadeus uses specific uppercase codes for passenger types.
  const mapPassengerType = (type) => {
    const typeMap = {
      adult: "ADULT",
      child: "CHILD",
      infant_without_seat: "HELD_INFANT",
    };
    return typeMap[type] || type.toUpperCase();
  };

  // Infants must be associated with an adult. Find the first adult's ID.
  const firstAdultId =
    (req.passengers.findIndex((p) => p.type === "adult") + 1).toString() || "1";

  return {
    currencyCode: "USD",
    originDestinations: req.slices.map((s, i) => ({
      id: (i + 1).toString(),
      originLocationCode: getIataCode(s.origin),
      destinationLocationCode: getIataCode(s.destination),
      departureDateTimeRange: { date: s.departure_date },
    })),
    travelers: req.passengers.map((p, i) => {
      const travelerId = (i + 1).toString();
      const travelerType = mapPassengerType(p.type);

      // Special handling for infants as required by Amadeus.
      if (travelerType === "HELD_INFANT") {
        return {
          id: travelerId,
          travelerType,
          associatedAdultId: firstAdultId,
        };
      }
      return { id: travelerId, travelerType };
    }),
    sources: ["GDS"],
    searchCriteria: {
      maxFlightOffers: 50,
      // You could add more criteria here, for example:
      // flightFilters: {
      //   cabinRestrictions: [{
      //     cabin: req.cabin_class.toUpperCase(),
      //     originDestinationIds: ["1"]
      //   }]
      // }
    },
  };
}

// --- NORMALIZERS ---

/**
 * Normalizes a flight offer from the Duffel API into a unified format.
 * @param {object} offer - A single offer from the Duffel API response.
 * @returns {object} A normalized flight offer object.
 */
const normalizeDuffelOffer = (offer) => ({
  id: offer.id,
  sourceApi: "duffel",
  total_amount: offer.total_amount,
  total_currency: offer.total_currency,
  slices: offer.slices.map((slice) => ({
    duration: slice.duration,
    origin: {
      city_name: slice.origin.city_name,
      airportName: slice.origin.name,
      iata_code: slice.origin.iata_code,
    },
    destination: {
      city_name: slice.destination.city_name,
      airportName: slice.destination.name,
      iata_code: slice.destination.iata_code,
    },
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
  // Duffel provides detailed baggage and cancellation conditions.
  conditions: offer.conditions,
});

/**
 * Normalizes a flight offer from the Amadeus API into a unified format.
 * @param {object} offer - A single offer from the Amadeus API response.
 * @param {object} dictionaries - The dictionaries object from the Amadeus response for lookups.
 * @returns {object} A normalized flight offer object.
 */
const normalizeAmadeusOffer = (offer, dictionaries) => {
  return {
    id: offer.id,
    sourceApi: "amadeus",
    total_amount: offer.price.total,
    total_currency: offer.price.currency,
    slices: offer.itineraries.map((itinerary) => {
      // **FIXED**: Extract the overall origin and destination for the slice,
      // ensuring its structure matches the Duffel normalizer.
      const firstSegment = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];
      const sliceOrigin =
        dictionaries.locations[firstSegment.departure.iataCode] || {};
      const sliceDestination =
        dictionaries.locations[lastSegment.arrival.iataCode] || {};

      return {
        duration: itinerary.duration,
        origin: {
          iata_code: firstSegment.departure.iataCode,
          city_name: sliceOrigin.cityCode,
          airportName: sliceOrigin.detailedName || sliceOrigin.name,
        },
        destination: {
          iata_code: lastSegment.arrival.iataCode,
          city_name: sliceDestination.cityCode,
          airportName: sliceDestination.detailedName || sliceDestination.name,
        },
        segments: itinerary.segments.map((seg) => {
          return {
            // Note: Amadeus segments don't have a top-level origin/destination object like Duffel.
            // We only need the departure and arrival info here.
            departing_at: seg.departure.at,
            arriving_at: seg.arrival.at,
            carrier: {
              iata_code: seg.carrierCode,
              name: dictionaries.carriers[seg.carrierCode],
            },
            flight_number: seg.number,
            duration: seg.duration,
            aircraft: { name: dictionaries.aircraft[seg.aircraft.code] },
            // Replicating the origin/destination structure inside the segment for consistency
            // which is useful for the deduplication key.
            origin: { iata_code: seg.departure.iataCode },
            destination: { iata_code: seg.arrival.iataCode },
          };
        }),
      };
    }),
    passengers: offer.travelerPricings.map((p) => {
      // Calculate total checked bags for the passenger across all segments.
      const checkedBags = p.fareDetailsBySegment.reduce(
        (acc, detail) => acc + (detail.includedCheckedBags?.quantity || 0),
        0
      );
      return {
        id: p.travelerId,
        type: p.travelerType.toLowerCase(),
        // Amadeus provides baggage allowance per segment, so we aggregate it.
        baggages: [
          { type: "carry_on", quantity: 1 }, // Assuming 1 carry-on is standard.
          ...(checkedBags > 0
            ? [{ type: "checked", quantity: checkedBags }]
            : []),
        ],
      };
    }),
    // Amadeus search results don't include rich conditions like Duffel.
    conditions: {},
  };
};

/**
 * Generates a unique key for a flight offer based on its itinerary.
 * This is used to deduplicate offers from different suppliers that are for the exact same flights.
 * @param {object} offer - A normalized flight offer.
 * @returns {string} A unique string key.
 */
const getItineraryKey = (offer) => {
  return offer.slices
    .map(
      (slice) =>
        slice.segments
          .map(
            (seg) =>
              // Key consists of: Carrier Code + Flight Number + Departure Airport
              `${seg.carrier?.iata_code}${seg.flight_number}-${seg.origin?.iata_code}`
          )
          .join("_") // Join segments within a slice
    )
    .join("__"); // Join multiple slices for round-trips
};

// --- 3. MAIN API ROUTE HANDLER ---
export async function POST(request) {
  try {
    const unifiedRequest = await request.json();
    if (!unifiedRequest.slices?.length) {
      return NextResponse.json(
        { success: false, error: "The 'slices' array is required." },
        { status: 400 }
      );
    }

    const duffelPayload = createDuffelPayload(unifiedRequest);
    const amadeusPayload = createAmadeusPayload(unifiedRequest);

    // Use Promise.allSettled to ensure we get results from one API
    // even if the other one fails.
    const [duffelResult, amadeusResult] = await Promise.allSettled([
      duffel.offerRequests.create({
        ...duffelPayload,
        max_connections: 1, // Limiting to 1 stop for simplicity
        return_offers: true,
      }),
      amadeus.shopping.flightOffersSearch.post(amadeusPayload),
    ]);

    const allOffers = [];
    const apiErrors = [];

    // Process Duffel results
    if (duffelResult.status === "fulfilled" && duffelResult.value.data) {
      allOffers.push(
        ...duffelResult.value.data.offers.map(normalizeDuffelOffer)
      );
    } else {
      console.error("Duffel API Error:", duffelResult.reason);
      apiErrors.push({
        source: "duffel",
        // **IMPROVED**: Provide more structured error details if available
        error: duffelResult.reason?.errors || [
          { title: "Unknown Duffel error" },
        ],
      });
    }

    // Process Amadeus results
    if (amadeusResult.status === "fulfilled" && amadeusResult.value.result) {
      const { data, dictionaries } = amadeusResult.value.result;
      if (data) {
        allOffers.push(
          ...data.map((offer) => normalizeAmadeusOffer(offer, dictionaries))
        );
      }
    } else {
      console.error("Amadeus API Error:", amadeusResult.reason);
      // **IMPROVED**: Amadeus SDK often puts detailed errors in `response.data.errors`
      const errorDetails =
        amadeusResult.reason?.response?.data?.errors ||
        amadeusResult.reason?.description ||
        "Unknown Amadeus error";
      apiErrors.push({
        source: "amadeus",
        error: errorDetails,
      });
    }

    // --- Deduplicate and Sort ---
    const uniqueOffers = new Map();
    allOffers.forEach((offer) => {
      const key = getItineraryKey(offer);
      const existingOffer = uniqueOffers.get(key);
      // If the flight is not yet in our map, or if the new offer is cheaper, add/replace it.
      if (
        !existingOffer ||
        parseFloat(offer.total_amount) < parseFloat(existingOffer.total_amount)
      ) {
        uniqueOffers.set(key, offer);
      }
    });

    const finalOffers = Array.from(uniqueOffers.values());
    // Sort the final list by price, ascending.
    finalOffers.sort(
      (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
    );

    // **REMOVED PAGINATION**: Server-side pagination is complex in a stateless API route
    // because you would need to cache the full result set between requests.
    // It's more robust to return the full, sorted list and let the client handle pagination.
    // The client can cache the results and display them page by page.

    return NextResponse.json({
      success: true,
      offers: finalOffers, // Return all unique, sorted offers
      meta: {
        api_errors: apiErrors,
        total_results: finalOffers.length,
      },
    });
  } catch (error) {
    console.error("❌ Unhandled Server Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
