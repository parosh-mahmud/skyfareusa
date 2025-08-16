// src/app/api/flights/orders/create/route.js
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
 * Normalizes a Duffel API response for an order creation.
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
    const { sourceApi, offer, passengers, services, payment, contacts } =
      await request.json();

    if (!sourceApi) {
      return NextResponse.json(
        { success: false, error: "sourceApi is required." },
        { status: 400 }
      );
    }

    let result;

    switch (sourceApi) {
      case "duffel":
        if (!offer || !passengers || !payment) {
          throw new Error(
            "Missing required fields for Duffel: offer, passengers, payment."
          );
        }

        // Prepare Duffel-specific payload
        const duffelPayload = {
          data: {
            selected_offers: [offer.id],
            passengers: passengers.map((p) => ({
              // Duffel expects a simple age or type, not both
              ...(p.age ? { age: p.age } : { type: p.type }),
              given_name: p.givenName,
              family_name: p.familyName,
              title: p.title,
              gender: p.gender,
              born_on: p.bornOn,
            })),
            payments: [
              {
                type: "balance",
                currency: payment.currency,
                amount: payment.amount,
              },
            ],
            // Include services if available
            ...(services &&
              services.length > 0 && {
                services: services.map((s) => ({
                  id: s.id,
                  quantity: s.quantity || 1,
                })),
              }),
          },
        };

        try {
          const duffelResponse = await duffel.orders.create(duffelPayload);
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
        if (!offer || !passengers || !contacts) {
          throw new Error(
            "Missing required fields for Amadeus: offer, passengers, contacts."
          );
        }

        // Prepare Amadeus-specific payload
        const amadeusPayload = {
          data: {
            type: "flight-order",
            flightOffers: [offer.rawOffer || offer],
            travelers: passengers.map((p, index) => ({
              id: (index + 1).toString(),
              dateOfBirth: p.dateOfBirth,
              name: {
                firstName: p.givenName,
                lastName: p.familyName,
              },
              gender: p.gender,
              contact: {
                emailAddress: contacts.email,
                phones: [
                  {
                    countryCode: contacts.phoneCountryCode,
                    number: contacts.phoneNumber,
                    deviceType: "MOBILE",
                  },
                ],
              },
              // Add other traveler data if needed
              // documents: [ ... ]
            })),
            contacts: [
              {
                emailAddress: contacts.email,
                phones: [
                  {
                    deviceType: "MOBILE",
                    countryCode: contacts.phoneCountryCode,
                    number: contacts.phoneNumber,
                  },
                ],
              },
            ],
          },
        };

        try {
          const amadeusResponse = await amadeus.booking.flightOrders.post(
            JSON.stringify(amadeusPayload)
          );
          // Amadeus response doesn't require complex normalization, just return it
          result = { success: true, rawResponse: amadeusResponse.result };
        } catch (amadeusError) {
          console.error("Amadeus API error:", amadeusError);
          const amadeusErrors = amadeusError.response?.data?.errors || [
            { message: "Unknown Amadeus API error" },
          ];
          return NextResponse.json(
            { success: false, error: amadeusErrors },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown API source." },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ API Error on creating order:", error);
    const errorMessage =
      error.message || "An unexpected server error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
