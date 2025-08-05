// import { Duffel } from "@duffel/api";
// import { NextResponse } from "next/server";

// // Initialize the Duffel client
// const duffel = new Duffel({
//   token: process.env.DUFFEL_ACCESS_TOKEN,
// });

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const {
//       origin,
//       destination,
//       departure_date,
//       return_date,
//       passengers,
//       cabin_class,
//     } = body;

//     // Based on the docs, using passenger age is more reliable
//     // to avoid mismatches with airline policies.
//     const searchPassengers = passengers || [{ age: 25 }];

//     // Create slices for the flight search
//     const slices = [
//       {
//         origin,
//         destination,
//         departure_date,
//       },
//     ];

//     // Add return slice if it's a round trip
//     if (return_date) {
//       slices.push({
//         origin: destination,
//         destination: origin,
//         departure_date: return_date,
//       });
//     }

//     // Create an offer request with the Duffel API
//     const offerRequest = await duffel.offerRequests.create({
//       slices,
//       passengers: searchPassengers,
//       cabin_class: cabin_class || "economy",
//       return_offers: true, // Ensure we get offers back in the response
//     });

//     console.log("Offer Request Created:", offerRequest.data.id);

//     // The offer request response now directly contains the offers
//     // if return_offers is true, so no separate offers.list() call is needed.
//     const offers = offerRequest.data.offers;
//     const meta = {
//       // Manually construct a meta object if needed, as it's not present here
//       limit: offers.length,
//       // 'after' cursor for pagination would come from a list() call if used
//       after: null,
//     };

//     return NextResponse.json({
//       success: true,
//       offer_request_id: offerRequest.data.id,
//       offers: offers,
//       meta: meta,
//     });
//   } catch (error) {
//     // Log the detailed error from the API for better debugging
//     console.error("Duffel API Error:", JSON.stringify(error.errors, null, 2));

//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message,
//         details: error.errors || "Unknown server error",
//       },
//       // Use the status code from the API error if available
//       { status: error.meta?.status || 500 }
//     );
//   }
// }

import { Duffel } from "@duffel/api";
import { NextResponse } from "next/server";

// Initialize the Duffel client
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const { slices, passengers, cabin_class } = await request.json();

    if (!slices || !Array.isArray(slices) || slices.length === 0) {
      return NextResponse.json(
        { success: false, error: "The 'slices' array is required." },
        { status: 400 }
      );
    }

    // Using .create() as shown in the library documentation
    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: cabin_class || "economy",
      return_offers: true,
    });

    console.log(`✅ Offer Request successful: ${offerRequest.data.id}`);

    return NextResponse.json({
      success: true,
      offer_request_id: offerRequest.data.id,
      offers: offerRequest.data.offers,
      meta: {
        // The meta object for pagination is not returned on create
        // but we can construct a partial one for the client.
        limit: offerRequest.data.offers.length,
        after: null, // The first response has no 'after' cursor
      },
    });
  } catch (error) {
    //
    // --- IMPROVEMENT BASED ON DOCUMENTATION ---
    //
    // The library throws a detailed error object. We now log the request_id
    // from `error.meta` and the structured errors from `error.errors`.
    //
    console.error("❌ Duffel API Error on Search:", {
      requestId: error.meta?.request_id,
      statusCode: error.meta?.status,
      errors: error.errors,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search for flights.",
        // Pass the structured error details back to the client
        details: error.errors || [
          { message: "An unknown server error occurred." },
        ],
      },
      { status: error.meta?.status || 500 }
    );
  }
}
