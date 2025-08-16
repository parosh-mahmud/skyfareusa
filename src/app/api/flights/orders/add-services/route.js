// // src/app/api/flights/offers/services/route.js
// import { Duffel } from "@duffel/api";
// import Amadeus from "amadeus";
// import { NextResponse } from "next/server";

// // --- 1. INITIALIZE API CLIENTS ---
// const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
// const amadeus = new Amadeus({
//   clientId: process.env.AMADEUS_API_KEY,
//   clientSecret: process.env.AMADEUS_API_SECRET,
// });

// // --- NORMALIZATION FUNCTIONS ---

// /**
//  * Normalizes a Duffel API response for adding services.
//  * @param {object} duffelResponse The raw Duffel API response.
//  * @returns {object} A normalized response object.
//  */
// const normalizeDuffelServices = (duffelResponse) => {
//   const { data } = duffelResponse;
//   // Duffel's response to add services is part of the orderChange object.
//   // We can extract relevant information or simply return the data for processing.
//   return {
//     success: true,
//     data: {
//       orderId: data.order_id,
//       services: data.services,
//     },
//   };
// };

// /**
//  * Normalizes an Amadeus API response for upselling branded fares.
//  * @param {object} amadeusResponse The raw Amadeus API response.
//  * @returns {object} A normalized response object.
//  */
// const normalizeAmadeusUpsell = (amadeusResponse) => {
//   const { data, meta } = amadeusResponse.result;

//   if (data && data.flightOffers) {
//     // The response is an array of upselled offers. We'll take the first one.
//     const upselledOffer = data.flightOffers[0];
//     return {
//       success: true,
//       data: {
//         offer: upselledOffer,
//         warnings: meta?.warnings || [],
//       },
//     };
//   }

//   // Handle case where upselling might not be successful
//   return {
//     success: false,
//     error: "Failed to retrieve upselled offers from Amadeus.",
//   };
// };

// // --- 2. MAIN API ROUTE HANDLER ---
// export async function POST(request) {
//   try {
//     const unifiedRequest = await request.json();
//     const { sourceApi, offer, services, orderId } = unifiedRequest;

//     if (!sourceApi) {
//       return NextResponse.json(
//         { success: false, error: "sourceApi is required." },
//         { status: 400 }
//       );
//     }

//     let apiResponse;
//     switch (sourceApi) {
//       case "duffel":
//         if (!orderId || !services) {
//           throw new Error("orderId and services are required for Duffel.");
//         }
//         apiResponse = await duffel.orderChange.addServices(orderId, {
//           services: services.map((s) => ({
//             id: s.id,
//             quantity: s.quantity || 1,
//           })),
//         });
//         const duffelNormalized = normalizeDuffelServices(apiResponse);
//         return NextResponse.json(duffelNormalized);

//       case "amadeus":
//         if (!offer) {
//           throw new Error("offer object is required for Amadeus.");
//         }
//         const amadeusPayload = {
//           data: {
//             type: "flight-offers-upselling",
//             flightOffers: [offer.rawOffer || offer],
//           },
//         };

//         const amadeusResponse =
//           await amadeus.shopping.flightOffers.upselling.post(
//             JSON.stringify(amadeusPayload)
//           );
//         const amadeusNormalized = normalizeAmadeusUpsell(amadeusResponse);
//         return NextResponse.json(amadeusNormalized);

//       default:
//         return NextResponse.json(
//           { success: false, error: "Unknown API source." },
//           { status: 400 }
//         );
//     }
//   } catch (error) {
//     console.error("❌ Unhandled Server Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "An unexpected server error occurred.",
//       },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/flights/orders/add-services/route.js
// src/app/api/flights/orders/add-services/route.js
import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// --- 1. INITIALIZE API CLIENTS ---
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

/**
 * Normalizes an Amadeus API response for an upselled offer.
 * @param {object} amadeusResponse The raw Amadeus API response.
 * @returns {object} A normalized offer object.
 */
const normalizeAmadeusUpsell = (amadeusResponse) => {
  const upselledOffer = amadeusResponse.data.flightOffers[0];
  return {
    success: true,
    offer: upselledOffer,
    meta: amadeusResponse.result.meta || {},
  };
};

/**
 * Normalizes a Duffel API response for an order change.
 * @param {object} duffelResponse The raw Duffel API response.
 * @returns {object} A normalized order object.
 */
const normalizeDuffelOrder = (duffelResponse) => {
  return {
    success: true,
    order: duffelResponse.data,
    meta: duffelResponse.meta || {},
  };
};

// --- 2. MAIN API ROUTE HANDLER ---
export async function POST(request) {
  try {
    const { sourceApi, orderId, offer, services } = await request.json();

    if (!sourceApi) {
      return NextResponse.json(
        { success: false, error: "sourceApi is required." },
        { status: 400 }
      );
    }

    let result;

    switch (sourceApi) {
      case "duffel":
        if (!orderId || !services || services.length === 0) {
          throw new Error(
            "orderId and at least one service are required for Duffel."
          );
        }

        try {
          // The correct way to add services to an existing order in Duffel is via an order change request
          const duffelResponse = await duffel.orderChangeRequests.create({
            order_id: orderId,
            add_services: services.map((s) => ({
              id: s.serviceId,
              quantity: s.quantity || 1,
              passenger_id: s.passengerId,
            })),
          });
          result = normalizeDuffelOrder(duffelResponse);
        } catch (duffelError) {
          console.error("Duffel API error:", duffelError);
          const duffelErrors = duffelError.errors || [
            { message: "Unknown Duffel API error" },
          ];
          return NextResponse.json(
            { success: false, error: duffelErrors },
            { status: 400 }
          );
        }
        break;

      case "amadeus":
        if (!offer || !offer.rawOffer) {
          throw new Error(
            "A raw Amadeus offer object is required for upselling."
          );
        }

        // Construct the upsell payload from the raw offer
        const amadeusPayload = {
          data: {
            type: "flight-offers-upselling",
            flightOffers: [offer.rawOffer],
          },
        };

        const amadeusResponse =
          await amadeus.shopping.flightOffers.upselling.post(
            JSON.stringify(amadeusPayload)
          );
        result = normalizeAmadeusUpsell(amadeusResponse);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown API source." },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ API Error on adding services:", error);
    const errorMessage =
      error.description ||
      error.message ||
      "An unexpected server error occurred.";
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: status }
    );
  }
}
