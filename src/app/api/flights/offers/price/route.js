// src/app/api/flights/offers/price/route.js
import { Duffel } from "@duffel/api";
import Amadeus from "amadeus";
import { NextResponse } from "next/server";

// Initialize the API clients
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

/**
 * This is the main handler for re-pricing a selected flight offer.
 */
export async function POST(request) {
  try {
    const { offerId, offer, sourceApi } = await request.json();

    // Validate the incoming request to ensure it has the necessary data
    if (!sourceApi || (!offerId && !offer)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: sourceApi and either offerId (for Duffel) or the full offer object (for Amadeus) are required.",
        },
        { status: 400 }
      );
    }

    let pricedOffer;

    // Use a switch to handle the different logic for each API provider
    switch (sourceApi) {
      case "duffel":
        console.log(`✈️  Repricing Duffel offer ID: ${offerId}`);
        // For Duffel, we get the latest version of the offer using its ID.
        const duffelResponse = await duffel.offers.get(offerId);

        // The response is already in a good format. We just add our sourceApi key.
        pricedOffer = { ...duffelResponse.data, sourceApi: "duffel" };
        break;

      case "amadeus":
        console.log(`✈️  Repricing Amadeus offer ID: ${offer.id}`);

        // Amadeus requires the original, unmodified offer object from the search results.
        // We check for a `rawOffer` property that we saved during the search normalization step.
        const offerToPrice = offer.rawOffer || offer;

        const amadeusResponse =
          await amadeus.shopping.flightOffers.pricing.post(
            JSON.stringify({
              data: {
                type: "flight-offers-pricing",
                flightOffers: [offerToPrice], // Send the complete, original offer object
              },
            })
          );

        const newPricedAmadeusOffer = amadeusResponse.data.flightOffers[0];

        // We return a consistent structure but MUST preserve the new raw offer for the final booking step.
        pricedOffer = {
          id: newPricedAmadeusOffer.id,
          sourceApi: "amadeus",
          total_amount: newPricedAmadeusOffer.price.total,
          total_currency: newPricedAmadeusOffer.price.currency,
          slices: newPricedAmadeusOffer.itineraries,
          passengers: newPricedAmadeusOffer.travelerPricings,
          // IMPORTANT: Preserve the newly priced raw offer for the next step (order creation)
          rawOffer: newPricedAmadeusOffer,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown or unsupported source API." },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, pricedOffer });
  } catch (error) {
    // Gracefully handle errors from either API provider
    const errorDetails = error.description || error.errors || error;
    console.error(
      "❌ API Error on Repricing:",
      JSON.stringify(errorDetails, null, 2)
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to confirm the flight's price. It may no longer be available.",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
