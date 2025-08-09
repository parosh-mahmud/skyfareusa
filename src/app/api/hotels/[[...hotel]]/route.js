import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

// This function handles all requests like /api/hotels/search, /api/hotels/offers, /api/hotels/book
async function handleRequest(request, action) {
  try {
    switch (action) {
      case "search": {
        const { cityCode, checkInDate, checkOutDate, adults } =
          await request.json();
        if (!cityCode || !checkInDate || !checkOutDate) {
          return NextResponse.json(
            { success: false, error: "Missing required fields." },
            { status: 400 }
          );
        }

        const hotelList =
          await amadeus.referenceData.locations.hotels.byCity.get({ cityCode });
        if (hotelList.data.length === 0)
          return NextResponse.json({ success: true, offers: [] });

        const hotelIds = hotelList.data.map((h) => h.hotelId);

        const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds: hotelIds.slice(0, 20).join(","), // Limit to 20 hotels per search
          adults: adults || 1,
          checkInDate,
          checkOutDate,
        });
        return NextResponse.json({
          success: true,
          offers: offersResponse.data,
        });
      }

      case "offer": {
        const { searchParams } = new URL(request.url);
        const offerId = searchParams.get("offerId");
        if (!offerId)
          return NextResponse.json(
            { success: false, error: "offerId is required." },
            { status: 400 }
          );

        const response = await amadeus.shopping.hotelOffer(offerId).get();
        return NextResponse.json({ success: true, data: response.data });
      }

      case "book": {
        const { offerId, guests, payments } = await request.json();
        if (!offerId || !guests || !payments) {
          return NextResponse.json(
            { success: false, error: "Missing required fields for booking." },
            { status: 400 }
          );
        }

        const bookingResponse = await amadeus.booking.hotelBookings.post(
          JSON.stringify({
            data: {
              offerId: offerId,
              guests: guests,
              payments: payments,
            },
          })
        );
        return NextResponse.json({ success: true, data: bookingResponse.data });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action." },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error(
      `❌ Amadeus Hotel API Error (${action}):`,
      error.description || error
    );
    const errorMessage =
      error.description?.detail || "An error occurred with the hotel API.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  // The details page uses GET to fetch a single offer
  const action = params.hotel?.[0];
  return handleRequest(request, action);
}

export async function POST(request, { params }) {
  // Search and Book actions use POST
  const action = params.hotel?.[0];
  return handleRequest(request, action);
}
