import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// --- 1. INITIALIZE API CLIENTS ---
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

// --- 2. ADAPTERS, NORMALIZATION, DEDUPLICATION ---

// Handles both simple strings (from Postman) and objects (from frontend)
const getIataCode = (location) =>
  typeof location === "object" ? location.code : location;

function createDuffelPayload(req) {
  return {
    slices: req.slices.map((s) => ({
      origin: getIataCode(s.origin),
      destination: getIataCode(s.destination),
      departure_date: s.departure_date,
    })),
    passengers: req.passengers,
    cabin_class: req.cabin_class,
  };
}

function createAmadeusPayload(req) {
  return {
    currencyCode: "USD",
    originDestinations: req.slices.map((s, i) => ({
      id: (i + 1).toString(),
      originLocationCode: getIataCode(s.origin),
      destinationLocationCode: getIataCode(s.destination),
      departureDateTimeRange: { date: s.departure_date },
    })),
    travelers: req.passengers.map((p, i) => ({
      id: (i + 1).toString(),
      travelerType: p.type.toUpperCase(),
    })),
    sources: ["GDS"],
    searchCriteria: { maxFlightOffers: 50 },
  };
}

// --- NORMALIZERS (Perfected for full data extraction) ---

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
  conditions: offer.conditions,
});

const normalizeAmadeusOffer = (offer, dictionaries) => ({
  id: offer.id,
  sourceApi: "amadeus",
  total_amount: offer.price.total,
  total_currency: offer.price.currency,
  slices: offer.itineraries.map((itinerary) => ({
    duration: itinerary.duration,
    segments: itinerary.segments.map((seg) => {
      const departureLoc = dictionaries.locations[seg.departure.iataCode] || {};
      const arrivalLoc = dictionaries.locations[seg.arrival.iataCode] || {};
      return {
        origin: {
          iata_code: seg.departure.iataCode,
          city_name: departureLoc.cityCode,
          airportName:
            departureLoc.subType === "AIRPORT" ? seg.departure.iataCode : "",
        },
        destination: {
          iata_code: seg.arrival.iataCode,
          city_name: arrivalLoc.cityCode,
          airportName:
            arrivalLoc.subType === "AIRPORT" ? seg.arrival.iataCode : "",
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
      };
    }),
  })),
  passengers: offer.travelerPricings.map((p) => {
    const checkedBags = p.fareDetailsBySegment.reduce(
      (acc, detail) => acc + (detail.includedCheckedBags?.quantity || 0),
      0
    );
    return {
      id: p.travelerId,
      type: p.travelerType.toLowerCase(),
      baggages: [
        { type: "carry_on", quantity: 1 }, // Assume 1 carry-on as default
        ...(checkedBags > 0
          ? [{ type: "checked", quantity: checkedBags }]
          : []),
      ],
    };
  }),
  conditions: {}, // Not available in Amadeus search response
  rawOffer: offer,
});

const getItineraryKey = (offer) => {
  return offer.slices
    .map((slice) =>
      slice.segments
        .map(
          (seg) =>
            `${seg.carrier?.iata_code}${seg.flight_number}-${seg.origin?.iata_code}`
        )
        .join("_")
    )
    .join("__");
};

// --- 3. MAIN API ROUTE HANDLER ---
export async function POST(request) {
  try {
    const unifiedRequest = await request.json();
    if (!unifiedRequest.slices?.length) {
      return NextResponse.json(
        { success: false, error: "Slices are required." },
        { status: 400 }
      );
    }

    const page = unifiedRequest.page || 1;
    const limit = 20; // Results per page

    let allOffers = [];
    const apiErrors = [];

    // Only fetch from APIs on the first page to build the full result set
    if (page === 1) {
      const duffelPayload = createDuffelPayload(unifiedRequest);
      const amadeusPayload = createAmadeusPayload(unifiedRequest);

      const duffelPromise = duffel.offerRequests.create({
        ...duffelPayload,
        max_connections: 1,
        return_offers: true,
      });
      const amadeusPromise =
        amadeus.shopping.flightOffersSearch.post(amadeusPayload);
      const results = await Promise.allSettled([duffelPromise, amadeusPromise]);
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
    }

    // This section can be improved with a cache (like Redis) to store `allOffers`
    // For now, we only support loading the first page.
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
    finalOffers.sort(
      (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
    );

    const paginatedOffers = finalOffers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      offers: paginatedOffers,
      meta: {
        api_errors: apiErrors,
        currentPage: page,
        hasNextPage: finalOffers.length > page * limit,
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
