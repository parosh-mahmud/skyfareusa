import Amadeus from "amadeus";
import { NextResponse } from "next/server";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function POST(request) {
  try {
    const { cityCode, hotelId, checkInDate, checkOutDate, adults } =
      await request.json();

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, error: "Check-in and Check-out dates are required." },
        { status: 400 }
      );
    }

    let hotelIds = [];

    // ✅ FIX: Add conditional logic to handle two types of searches
    if (hotelId) {
      // Case 1: A specific hotel was selected from autocomplete
      hotelIds = [hotelId];
    } else if (cityCode) {
      // Case 2: A city was selected
      const hotelListResponse =
        await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: cityCode,
        });
      hotelIds = hotelListResponse.data.map((hotel) => hotel.hotelId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either a cityCode or a hotelId is required.",
        },
        { status: 400 }
      );
    }

    if (hotelIds.length === 0) {
      return NextResponse.json({
        success: true,
        offers: [],
        meta: { hasNextPage: false },
      });
    }

    // This part remains the same, as it gets offers for the list of IDs we prepared.
    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.slice(0, 30).join(","),
      adults: adults || "1",
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      paymentPolicy: "NONE",
      bestRateOnly: true,
    });

    return NextResponse.json({
      success: true,
      offers: offersResponse.data,
      meta: {
        hasNextPage: false,
      },
    });
  } catch (error) {
    console.error("❌ Amadeus Hotel Search Error:", error.description || error);
    const errorMessage =
      error.description?.detail || "An error occurred with the hotel provider.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
